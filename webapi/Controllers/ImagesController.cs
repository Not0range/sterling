using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

using StackExchange.Redis;

using System.Drawing;
using System.Drawing.Imaging;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ApiBase
    {
        public ImagesController(SterlingContext context, 
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer) :
            base(context, multiplexer, localizer)
        { }

        [HttpGet("product/{id}")]
        public async Task<ActionResult> GetProduct(int id)
        {
            var product = await _ctx.Products.AsNoTracking().FirstOrDefaultAsync(t =>  t.Id == id);
            if (product == null || product.Image == null) return NotFound();

            return File(product.Image, "image/*");
        }

        [HttpGet("category/{id}")]
        public async Task<ActionResult> GetCategory(int id)
        {
            var category = await _ctx.Categories.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
            if (category == null || category.Image == null) return NotFound();

            return File(category.Image, "image/*");
        }

        [HttpPost("product/{id}")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult> UploadProduct(int id, IFormFile file)
        {
            if (file == null) return BadRequest();

            var product = await _ctx.Products.FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            var stream = file.OpenReadStream();
            var mem = new MemoryStream();
            await stream.CopyToAsync(mem);

            stream.Close();
            product.Image = mem.ToArray();
            mem.Close();

            await _ctx.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("category/{id}")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult> UploadCategory(int id, IFormFile file)
        {
            if (file == null) return BadRequest();

            var category = await _ctx.Categories.FirstOrDefaultAsync(t => t.Id == id);
            if (category == null) return NotFound();

            var stream = file.OpenReadStream();
            var mem = new MemoryStream();
            await stream.CopyToAsync(mem);

            stream.Close();
            category.Image = mem.ToArray();
            mem.Close();

            await _ctx.SaveChangesAsync();
            return Ok();
        }
    }
}
