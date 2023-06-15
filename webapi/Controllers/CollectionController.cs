using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

using NRedisStack.RedisStackCommands;

using StackExchange.Redis;
using RedisOrder = StackExchange.Redis.Order;

using System.Linq;

using webapi.Models.ProductModels;
using ProductOrder = webapi.Models.ProductModels.Order;
using System.Text.Json;

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
                    GroupTitle = t1.Group.Title,
                    Title = t1.Title,
                    Price = t1.Price,
                    Count = t2.Count,
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
                .Select(t => new KeyValuePair<int, int>((int)t.Name, (int)t.Value))) :
                new Dictionary<int, int>();

            if (item.Count > 0)
                await db.HashSetAsync(key, item.Id, item.Count);
            else if (items.ContainsKey(item.Id) && item.Count == 0)
                await db.HashDeleteAsync(key, item.Id);

            return Ok();
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<IEnumerable<ShortProduct>>> Bookmark()
        {
            var cart = $"cart:{UserId}";
            var key = $"bookmark:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<ShortProduct>();

            var items = (await db.SetMembersAsync(key)).Select(t => (int)t);
            return _ctx.ProductGroups.Include(t => t.Products).Include(t => t.Category)
                .AsEnumerable()
                .Join(items, t => t.Id, t => t, (t1, t2) => new ShortProduct
                {
                    Id = t1.Id,
                    Title = t1.Title,
                    Cart = t1.Products.Select(t2 => db.HashGet(cart, t2.Id, CommandFlags.None).Get(0)).Sum(),
                    ImageUrl = $"api/images/product/{t1.Products
                        .FirstOrDefault(t2 => t2.Image != null)?.Id ?? 0}",
                    Price = t1.Products.Count > 0 ? t1.Products.Max(p => p.Price) : 0,
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
        public async Task<ActionResult<IEnumerable<ShortProduct>>> History()
        {
            var cart = $"cart:{UserId}";
            var key = $"history:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<ShortProduct>();

            var items = (await db.SortedSetRangeByScoreAsync(key, order: RedisOrder.Descending))
                .Select(t => (int)t);
            return _ctx.ProductGroups.Include(t => t.Products).Include(t => t.Category)
                .AsEnumerable()
                .Join(items, t => t.Id, t => t, (t1, t2) => new ShortProduct
                {
                    Id = t1.Id,
                    Title = t1.Title,
                    Cart = t1.Products.Select(t2 => db.HashGet(cart, t2.Id, CommandFlags.None).Get(0)).Sum(),
                    ImageUrl = $"api/images/product/{t1.Products.FirstOrDefault(t2 => t2.Image != null)?.Id ?? 0}",
                    Price = t1.Products.Count > 0 ? t1.Products.Max(p => p.Price) : 0,
                }).ToList();
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<IEnumerable<ProductOrder>>> Orders()
        {
            var key = $"orders:{UserId}";
            var db = _redis.GetDatabase();

            if (!await db.KeyExistsAsync(key)) return Array.Empty<ProductOrder>();
            var json = db.JSON();

            return await json.GetAsync<ProductOrder[]>(key);
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult> MakeOrder()
        {
            var orderId = "ordersCount";

            var cart = $"cart:{UserId}";
            var key = $"orders:{UserId}";
            var db = _redis.GetDatabase();
            var json = db.JSON();

            if (!await db.KeyExistsAsync(cart)) return NotFound();

            var items = (await db.HashGetAllAsync(cart))
                .Select(t => new CartItem { Id = (int)t.Name, Count = (int)t.Value });
            var orderItems = _ctx.Products.Include(t => t.Group).AsEnumerable()
                .Join(items, t => t.Id, t => t.Id, (t1, t2) => new OrderItem
                {
                    Id = t1.Id,
                    GroupTitle = t1.Group.Title,
                    Title = t1.Title,
                    Count = t2.Count,
                    Price = t1.Price,
                }).ToArray();

            if (!await db.KeyExistsAsync(key)) await json.SetAsync(key, "$", Array.Empty<ProductOrder>());

            if (!await db.KeyExistsAsync(orderId)) await db.StringSetAsync(orderId, 1);

            var id = (int)await db.StringGetAsync(orderId);
            await json.ArrAppendAsync(key, "$", new ProductOrder
            {
                Id = id,
                UserId = UserId,
                Status = OrderStatus.Pending,
                Items = orderItems,
                TotalPrice = orderItems.Sum(t => t.Price * t.Count)
            });
            await db.StringSetAsync(orderId, id + 1);
            await db.KeyDeleteAsync(cart);

            return Ok();
        }

        [HttpDelete("order/{id}"), Authorize]
        public async Task<ActionResult> CancelOrder(int id)
        {
            var key = $"orders:{UserId}";
            var db = _redis.GetDatabase();
            var json = db.JSON();

            if (!await db.KeyExistsAsync(key)) return NotFound();

            var orders = await json.GetAsync<ProductOrder[]>(key);
            int i = 0;
            for (; i < orders.Length; i++)
                if (orders[i].Id == id)
                    break;
            if (i == orders.Length) return NotFound();

            var order = JsonSerializer.Deserialize<ProductOrder>((await json.ArrPopAsync(key, "$", i)).First().ToString());
            order.Status = OrderStatus.Canceled;
            await json.ArrInsertAsync(key, "$", i, order);
            return Ok();
        }

        [HttpGet("order/admin/"), Authorize(Roles = "1")]
        public async Task<ActionResult<IEnumerable<ProductOrder>>> AdminOrders()
        {
            var db = _redis.GetDatabase();
            var json = db.JSON();

            var list = new List<ProductOrder>();
            await foreach (var key in _redis.GetServer("localhost", 6379).KeysAsync(pattern: "orders:*"))
                list.AddRange(await json.GetAsync<ProductOrder[]>(key));

            return list;
        }

        [HttpDelete("order/admin/{userId}"), Authorize(Roles = "1")]
        public async Task<ActionResult> AdminCancelOrder(int userId, int id)
        {
            var key = $"orders:{userId}";
            var db = _redis.GetDatabase();
            var json = db.JSON();

            if (!await db.KeyExistsAsync(key)) return NotFound();

            var orders = await json.GetAsync<ProductOrder[]>(key);
            int i = 0;
            for (; i < orders.Length; i++)
                if (orders[i].Id == id)
                    break;
            if (i == orders.Length) return NotFound();

            var order = JsonSerializer.Deserialize<ProductOrder>((await json.ArrPopAsync(key, "$", i)).First().ToString());
            order.Status = OrderStatus.Canceled;
            await json.ArrInsertAsync(key, "$", i, order);
            return Ok();
        }

        [HttpPost("order/admin/{userId}"), Authorize(Roles = "1")]
        public async Task<ActionResult> AdminCompleteOrder(int userId, int id)
        {
            var key = $"orders:{userId}";
            var db = _redis.GetDatabase();
            var json = db.JSON();

            if (!await db.KeyExistsAsync(key)) return NotFound();

            var orders = await json.GetAsync<ProductOrder[]>(key);
            int i = 0;
            for (; i < orders.Length; i++)
                if (orders[i].Id == id)
                    break;
            if (i == orders.Length) return NotFound();

            var order = JsonSerializer.Deserialize<ProductOrder>((await json.ArrPopAsync(key, "$", i)).First().ToString());
            order.Status = OrderStatus.Completed;
            await json.ArrInsertAsync(key, "$", i, order);
            return Ok();
        }
    }
}
