using System.Text;
using Backend.Data;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- 1. Konfiguration laden ----------
var configuration = builder.Configuration;

// ---------- 2. Datenbank einrichten ----------
builder.Services.AddDbContext<DoggoContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("TestConnection")));

// ---------- 3. Services (z.B. für DI) ----------
builder.Services.AddScoped<IAuthService, AuthService>();


// ---------- 4. JWT Auth konfigurieren ----------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSecret = configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured.");
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured.");
        var jwtAudience = configuration["JwtSettings:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured.");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT Fehler: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ---------- 5. Controller aktivieren ----------
builder.Services.AddControllers();

// ---------- 6. App bauen ----------
var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthentication();  // ← Muss VOR UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();