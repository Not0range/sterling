using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System.Security.Claims;

using System.Text;
using System.Security.Cryptography;
using webapi.Entities;
using StackExchange.Redis;
using NRedisStack.RedisStackCommands;
using Microsoft.EntityFrameworkCore;
using webapi.Models.UserForms;
using Microsoft.Extensions.Localization;
using Microsoft.AspNetCore.Localization;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ApiBase
    {
        public UserController(SterlingContext context, 
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer) :
            base(context, multiplexer, localizer)
        { }

        private async Task<Profile> GetProfile(User user)
        {
            var db = _redis.GetDatabase();
            var cart = await db.HashLengthAsync($"cart:{UserId}");
            return new Profile { 
                Name = user.Name, 
                IsAdmin = user.Role == UserRole.Admin, 
                CartCount = (int)cart
            };
        }

        private async Task<ActionResult> _logout(bool ok = false)
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return ok ? Ok() : Unauthorized();
        }


        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult<Profile>> GetMe()
        {
            var user = await _ctx.Users.AsNoTracking().FirstOrDefaultAsync(t => t.Id == UserId);
            if (user == null) return await _logout();

            return await GetProfile(user);
        }

        [HttpPost("[action]")]
        public async Task<ActionResult<Profile>> Login([FromForm] LoginForm form)
        {
            var user = await _ctx.Users.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Username == form.Username.ToLower() ||
                t.Email == form.Username.ToLower());
            if (user == null) return NotFound();

            var sha = SHA256.Create();
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(form.Password));
            var hash = Encoding.UTF8.GetString(await sha.ComputeHashAsync(stream));
            stream.Close();

            if (user.Password != hash)
                return NotFound();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.GivenName, user.Username),
                new Claim(ClaimTypes.Sid, user.Id.ToString()),
                new Claim(ClaimTypes.Role, ((int)user.Role).ToString())
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity), new AuthenticationProperties
                {
                    ExpiresUtc = DateTimeOffset.UtcNow.AddDays(1)
                });
            return await GetProfile(user);
        }

        [HttpPost("[action]")]
        public async Task<ActionResult<Profile>> Register([FromForm] RegisterForm form)
        {
            var user = await _ctx.Users.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Username == form.Username.ToLower() || 
                t.Email == form.Email.ToLower());
            if (user != null) return BadRequest();

            var sha = SHA256.Create();
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(form.Password));
            var hash = Encoding.UTF8.GetString(await sha.ComputeHashAsync(stream));
            stream.Close();

            user = new User
            {
                Username = form.Username.ToLower(),
                Email = form.Email.ToLower(),
                Name = form.Name,
                Password = hash,
                BirthDate = DateOnly.FromDateTime(form.BirthDate),
                Role = UserRole.User
            };
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.GivenName, user.Username),
                new Claim(ClaimTypes.Sid, user.Id.ToString()),
                new Claim(ClaimTypes.Role, ((int)user.Role).ToString())
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity), new AuthenticationProperties
                {
                    ExpiresUtc = DateTimeOffset.UtcNow.AddDays(1)
                });
            return await GetProfile(user);
        }

        [HttpGet("[action]"), Authorize]
        public async Task<ActionResult> Logout()
        {
            return await _logout(true);
        }

        [HttpPost("[action]"), Authorize]
        public async Task<ActionResult> ChangePassword(ChangePasswordForm form)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(t => t.Id == UserId);
            if (user == null) return await _logout();

            var sha = SHA256.Create();
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(form.OldPassword));
            var hash = Encoding.UTF8.GetString(await sha.ComputeHashAsync(stream));
            stream.Close();

            if (user.Password != hash)
                return BadRequest();

            stream = new MemoryStream(Encoding.UTF8.GetBytes(form.NewPassword));
            hash = Encoding.UTF8.GetString(await sha.ComputeHashAsync(stream));
            user.Password = hash;

            await _ctx.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("lang/{locale}")]
        public ActionResult SetLanguage(string locale)
        {
            Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, 
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(locale)));
            return Ok();
        }
    }
}
