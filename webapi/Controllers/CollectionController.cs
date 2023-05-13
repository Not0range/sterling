using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

using StackExchange.Redis;

using webapi.Models.ProductModels;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CollectionController : ApiBase
    {
        public CollectionController(SterlingContext context,
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer) :
            base(context, multiplexer, localizer)
        { }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<IEnumerable<CartItemFull>>> Cart()
        {
            var key = $"cart:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<CartItemFull>();

            var items = (await db.HashGetAllAsync(key))
                .Select(t => new CartItem { Id = (int)t.Name, Count = (int)t.Value });
            return _ctx.Products.Include(t => t.Group).AsEnumerable()
                .Join(items, t => t.Id, t => t.Id, (t1, t2) => new CartItemFull
                {
                    Id = t1.Id,
                    GroupId = t1.GroupId,
                    Title = t1.Title,
                    Price = t1.Price,
                    Count = t2.Count
                }).ToList();
        }

        [HttpPost("[action]"), Authorize]
        public async Task<ActionResult> Cart(CartItem item)
        {
            var product = await _ctx.Products.FirstOrDefaultAsync(t => t.Id == item.Id);
            if (product == null) return NotFound();

            var key = $"cart:{UserId}";
            var db = _redis.GetDatabase();

            var items = await db.KeyExistsAsync(key) ?
                new Dictionary<int, int>((await db.HashGetAllAsync(key))
                .Select(t => new KeyValuePair<int, int>((int)t.Name,(int)t.Value))) :
                new Dictionary<int, int>();

            if (item.Count > 0)
                await db.HashSetAsync(key, item.Id, item.Count);
            else if (items.ContainsKey(item.Id) && item.Count == 0)
                await db.HashDeleteAsync(key, item.Id);

            return Ok();
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<IEnumerable<Product>>> Bookmark()
        {
            var key = $"bookmark:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<Product>();

            var items = (await db.SetMembersAsync(key)).Select(t => (int)t);
            return _ctx.ProductGroups.Include(t => t.Products).Include(t => t.Category)
                .AsEnumerable()
                .Join(items, t => t.Id, t => t, (t1, t2) => new Product
                {
                    Id = t1.Id,
                    Category = t1.Category.Title,
                    Title = t1.Title,
                    Description = t1.Description,
                    Types = t1.Products
                    .Select(t2 => new ProductType { Id = t2.Id, Title = t2.Title, Price = t2.Price })
                }).ToList();
        }

        [HttpGet("[action]/{id}"), Authorize]
        public async Task<ActionResult> Bookmark(int id)
        {
            var product = await _ctx.ProductGroups.FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            var key = $"bookmark:{UserId}";
            var db = _redis.GetDatabase();

            var items = (await db.KeyExistsAsync(key) ?
                await db.SetMembersAsync(key) :
                Array.Empty<RedisValue>()).Select(t => (int)t).ToList();
            var i = items.FindIndex(t => t == id);
            if (i >= 0)
                await db.SetRemoveAsync(key, id);
            else
                await db.SetAddAsync(key, id);
            
            return Ok();
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<IEnumerable<Product>>> History()
        {
            var key = $"history:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<Product>();

            var items = (await db.SortedSetRangeByScoreAsync(key, order: Order.Descending))
                .Select(t => (int)t);
            return _ctx.ProductGroups.Include(t => t.Products).Include(t => t.Category)
                .AsEnumerable()
                .Join(items, t => t.Id, t => t, (t1, t2) => new Product
                {
                    Id = t1.Id,
                    Category = t1.Category.Title,
                    Title = t1.Title,
                    Description = t1.Description,
                    Types = t1.Products
                    .Select(t2 => new ProductType { Id = t2.Id, Title = t2.Title, Price = t2.Price })
                }).ToList();
        }

        //[HttpGet("[action]/{id}"), Authorize]
        //public async Task<ActionResult> History(int id)
        //{
        //    var key = $"history:{UserId}";
        //    var db = _redis.GetDatabase();

        //    await db.SortedSetAddAsync(key, id, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
        //    return Ok();
        //}
    }
}
