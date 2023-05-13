using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

using StackExchange.Redis;

using webapi;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(option =>
    {
        option.ExpireTimeSpan = new TimeSpan(24, 0, 0);
        option.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        option.Cookie.SameSite = SameSiteMode.None;
        option.AccessDeniedPath = string.Empty;
    });

var connectionString = builder.Configuration.GetConnectionString("Database");
builder.Services.AddDbContext<SterlingContext>(option => 
    option.UseNpgsql(connectionString));

var multiplexer = ConnectionMultiplexer.Connect("localhost");
builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);

builder.Services.AddLocalization(option => option.ResourcesPath = "Locales");

var app = builder.Build();

var supportedLocalizations = builder.Configuration.GetSection("Locales").GetChildren().Select(t => t.Value).ToArray();
var localizationOption = new RequestLocalizationOptions().SetDefaultCulture(supportedLocalizations[0])
    .AddSupportedCultures(supportedLocalizations);
app.UseRequestLocalization(localizationOption);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
