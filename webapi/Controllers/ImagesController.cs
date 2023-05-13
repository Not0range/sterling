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

        [HttpGet("{id}")]
        public async Task<ActionResult> Get(int id)
        {
            var product = await _ctx.Products.AsNoTracking().FirstOrDefaultAsync(t =>  t.Id == id);
            if (product == null || product.Image == null) return NotFound();

            return File(product.Image, "image/png");
        }

        [HttpPost("{id}")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult> Upload(int id, IFormFile file)
        {
            if (file == null) return BadRequest();

            var product = await _ctx.Products.FirstOrDefaultAsync(t => t.Id == id);
            if (product == null) return NotFound();

            var stream = file.OpenReadStream();
#pragma warning disable CA1416 // Validate platform compatibility
            var img = Image.FromStream(stream, false, true);
            stream.Close();
            var mem = new MemoryStream();
            img.Save(mem, ImageFormat.Png);
#pragma warning restore CA1416 // Validate platform compatibility

            product.Image = mem.ToArray();
            mem.Close();
            await _ctx.SaveChangesAsync();
            return Ok();
        }
    }
}
