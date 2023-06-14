using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

using StackExchange.Redis;

using webapi.Entities;
using webapi.Models.ProductModels;

using Product = webapi.Models.ProductModels.Product;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ApiBase
    {
        public ProductController(SterlingContext context, 
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer) :
            base(context, multiplexer, localizer)
        { }

        [HttpGet("id/{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var bookmark = $"bookmark:{UserId}";
            var cart = $"cart:{UserId}";
            var history = $"history:{UserId}";
            var db = _redis.GetDatabase();

            var product = await _ctx.ProductGroups.AsNoTracking()
                .Include(t => t.Category).Include(t => t.Products)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            if (UserId != -1)
                await db.SortedSetAddAsync(history, id, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());

            return new Product
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                Category = product.Category.Title,
                Title = product.Title,
                Description = product.Description,
                Favorite = db.SetContains(bookmark, product.Id, CommandFlags.None),
                Types = product.Products
                    .Select(t2 => new ProductType
                    {
                        Id = t2.Id,
                        Title = t2.Title,
                        Price = t2.Price,
                        Cart = db.HashGet(cart, t2.Id, CommandFlags.None).Get(0),
                        Image = t2.Image != null
                    })
            };
        }

        [HttpGet("{page}")]
        public IEnumerable<ShortProduct> GetProducts(int page = 1)
        {
            var cart = $"cart:{UserId}";
            var db = _redis.GetDatabase();

            return _ctx.ProductGroups.AsNoTracking().OrderByDescending(t => t.Id)
                .Skip(ITEMS_COUNT * (page - 1)).Take(ITEMS_COUNT)
                .Include(t => t.Products).AsEnumerable()
                .Select(t => new ShortProduct
                {
                    Id = t.Id,
                    Title = t.Title,
                    Cart = t.Products.Select(t2 => db.HashGet(cart, t2.Id, CommandFlags.None).Get(0)).Sum(),
                    ImageUrl = $"api/images/product/{t.Products.OrderByDescending(t1 => t1.Id)
                        .FirstOrDefault(t2 => t2.Image != null)?.Id ?? 0}",
                    Price = t.Products.Count > 0 ? t.Products.Max(p => p.Price) : 0,
                });
        }

        [HttpGet("category/{id}/{page}")]
        public IEnumerable<ShortProduct> GetByCategory(int id, int page = 1)
        {
            var cart = $"cart:{UserId}";
            var db = _redis.GetDatabase();

            return _ctx.ProductGroups.AsNoTracking().OrderByDescending(t => t.Id)
                .Where(t => t.CategoryId == id)
                .Skip(ITEMS_COUNT * (page - 1)).Take(ITEMS_COUNT)
                .Include(t => t.Products).AsEnumerable()
                .Select(t => new ShortProduct
                {
                    Id = t.Id,
                    Title = t.Title,
                    Cart = t.Products.Select(t2 => db.HashGet(cart, t2.Id, CommandFlags.None).Get(0)).Sum(),
                    ImageUrl = $"api/images/product/{t.Products.OrderByDescending(t1 => t1.Id)
                        .FirstOrDefault(t2 => t2.Image != null)?.Id ?? 0}",
                    Price = t.Products.Count > 0 ? t.Products.Max(p => p.Price) : 0,
                });
        }

        [HttpGet("search/{page}")]
        public IEnumerable<ShortProduct> Search(string query, [FromQuery] SearchParams searchParams, int page = 1)
        {
            var cart = $"cart:{UserId}";
            var db = _redis.GetDatabase();

            return _ctx.ProductGroups.AsNoTracking().Where(t => t.Title.ToLower().Contains(query.ToLower()))
                .Skip(ITEMS_COUNT * (page - 1)).Take(ITEMS_COUNT).Include(t => t.Products).AsEnumerable()
                .Select(t => new ShortProduct
                {
                    Id = t.Id,
                    Title = t.Title,
                    Cart = t.Products.Select(t2 => db.HashGet(cart, t2.Id, CommandFlags.None).Get(0)).Sum(),
                    ImageUrl = $"api/images/product/{t.Products.FirstOrDefault(t2 => t2.Image != null)?.Id ?? 0}",
                    Price = t.Products.Count > 0 ? t.Products.Max(p => p.Price) : 0,
                });
        }

        [HttpPut, Authorize(Roles = "1")]
        public async Task<ActionResult<Product>> AddProduct(ProductForm form)
        {
            if (!form.IsValid()) return BadRequest();

            var product = new ProductGroup 
            { 
                Title = form.Title, 
                Description = form.Description, 
                CategoryId = form.CategoryId.Value 
            };
            await _ctx.ProductGroups.AddAsync(product);
            await _ctx.SaveChangesAsync();

            await _ctx.Products.AddRangeAsync(form.Types.Select(t => new Entities.Product
            {
                GroupId = product.Id,
                Title = t.Title,
                Price = t.Price
            }));
            await _ctx.SaveChangesAsync();

            var types = product.Products
                    .Select(t2 => new ProductType { Id = t2.Id, Title = t2.Title, Price = t2.Price });
            product = _ctx.ProductGroups.AsNoTracking()
                .Include(t => t.Category).FirstOrDefault(t => t.Id == product.Id);
            return new Product
            {
                Id = product.Id,
                Category = product.Category.Title,
                Title = product.Title,
                Description = product.Description,
                Types = types
            };
        }

        [HttpPost("{id}"), Authorize(Roles = "1")]
        public async Task<ActionResult<Product>> EditProduct(int id, ProductForm form)
        {
            var product = await _ctx.ProductGroups
                .Include(t => t.Category).Include(t => t.Products).FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            product.Title = form.Title.Select(product.Title);
            product.Description = form.Description.Select(product.Description);
            product.CategoryId = form.CategoryId ?? product.CategoryId;
            if (form.Types != null && form.Types.Any())
            {
                var list = _ctx.Products.Where(t => t.GroupId == product.Id).Select(t => t.Id).ToList();

                await _ctx.Products.AddRangeAsync(form.Types.Where(t => t.Id == null).Select(t => new Entities.Product
                {
                    GroupId = product.Id,
                    Title = t.Title,
                    Price = t.Price
                }));
                foreach (var temp in form.Types.Where(t => t.Id != null))
                {
                    var type = await _ctx.Products.FirstOrDefaultAsync(t => t.Id == temp.Id);
                    type.Title = temp.Title;
                    type.Price = temp.Price;
                }

                foreach (var temp in list)
                    if (!form.Types.Any(t => t.Id == temp))
                        _ctx.Products.Remove(await _ctx.Products.FirstOrDefaultAsync(t => t.Id == temp));
            }
            await _ctx.SaveChangesAsync();

            return new Product
            {
                Id = product.Id,
                Category = product.Category.Title,
                Title = product.Title,
                Description = product.Description,
                Types = product.Products
                    .Select(t2 => new ProductType { Id = t2.Id, Title = t2.Title, Price = t2.Price })
            };
        }

        [HttpDelete("{id}"), Authorize(Roles = "1")]
        public async Task<ActionResult> RemoveProduct(int id)
        {
            var product = await _ctx.ProductGroups.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            _ctx.ProductGroups.Remove(product);
            await _ctx.SaveChangesAsync();
            return Ok();
        }
    }
}
