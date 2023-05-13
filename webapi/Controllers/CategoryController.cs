using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

using StackExchange.Redis;

using System.Data;

using webapi.Entities;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ApiBase
    {
        public CategoryController(SterlingContext context, 
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer) :
            base(context, multiplexer, localizer)
        { }

        [HttpGet]
        public IEnumerable<Category> GetCategories()
        {
            return _ctx.Categories.AsNoTracking();
        }

        [HttpPut, Authorize(Roles = "1")]
        public async Task<ActionResult<Category>> AddCategory([FromBody] string title)
        {
            var category = await _ctx.Categories.AsNoTracking().FirstOrDefaultAsync(t => t.Title.ToLower() == title.ToLower());
            if (category != null) return BadRequest();

            category = new Category { Title = title };
            await _ctx.Categories.AddAsync(category);
            await _ctx.SaveChangesAsync();
            return category;
        }

        [HttpPost("{id}"), Authorize(Roles = "1")]
        public async Task<ActionResult<Category>> EditCategory(int id, [FromBody] string title)
        {
            var category = await _ctx.Categories.FirstOrDefaultAsync(t => t.Id == id);
            if (category == null) return NotFound();

            category.Title = title;
            await _ctx.SaveChangesAsync();
            return category;
        }

        [HttpDelete("{id}"), Authorize(Roles = "1")]
        public async Task<ActionResult> RemoveCategory(int id)
        {
            var category = await _ctx.Categories.FirstOrDefaultAsync(t => t.Id == id);
            if (category == null) return NotFound();

            _ctx.Categories.Remove(category);
            await _ctx.SaveChangesAsync();
            return Ok();
        }
    }
}
