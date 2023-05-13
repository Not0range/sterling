using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

using StackExchange.Redis;

using System.Security.Claims;

namespace webapi.Controllers
{
    public abstract class ApiBase : ControllerBase
    {
        protected const int ITEMS_COUNT = 20;

        protected readonly SterlingContext _ctx;
        protected readonly IConnectionMultiplexer _redis;
        protected readonly IStringLocalizer<ApiBase> _localizer;

        protected int UserId =>
            int.Parse(User.Claims.FirstOrDefault(t => t.Type == ClaimTypes.Sid)?.Value ?? "-1");

        protected ApiBase(SterlingContext context, 
            IConnectionMultiplexer multiplexer,
            IStringLocalizer<ApiBase> localizer)
        {
            _ctx = context;
            _redis = multiplexer;
            _localizer = localizer;
        }
    }
}
