using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService: IAuthService
{
    private readonly DoggoContext _context;
    private readonly IConfiguration _configuration;
    private readonly JwtService _jwtService;
    
    public AuthService(DoggoContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }
    
    public async Task<ApiResponse<User>> LoginAsync(string email, string password, string? username)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == email || u.UserName == username);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or username.");
        }
        if (!VerifyPassword(password, user.GetPasswordHash(), user.GetPasswordSalt()))
        {
            throw new UnauthorizedAccessException("Wrong password.");
        }
        user.Token = new Token()
        {
            AccessToken = _jwtService.CreateJwtToken(user),
            RefreshToken = _jwtService.GenerateRefreshToken(),
            AccesTokenExpiresIn = DateTime.UtcNow.AddMinutes(60),
            RefreshTokenExpiresIn = DateTime.UtcNow.AddDays(7),
        };
        await _context.SaveChangesAsync();

        return new ApiResponse<User>()
        {
            success = true,
            data = user,
            message = "User logged in successfully.",
            timeStamp = DateTime.Now.ToString("o"),
        };
    }

    public async Task<ApiResponse<User>> RegisterAsync(string userName, string name, string email, string password)
    {
        if (await _context.Users.AnyAsync(u => u.UserName == userName)) return null!;
        CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
        var user = new User(passwordHash, passwordSalt)
        {
            UserName = userName,
            Name = name,
            Email = email,
        };
        var token = new Token()
        {
            AccessToken = _jwtService.CreateJwtToken(user),
            RefreshToken = _jwtService.GenerateRefreshToken(),
            AccesTokenExpiresIn = DateTime.UtcNow.AddMinutes(60),
            RefreshTokenExpiresIn = DateTime.UtcNow.AddDays(7),
        };
        
        user.Token = token;
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new ApiResponse<User>()
        {
            success = true,
            message = "User registered successfully.",
            data = user,
            timeStamp = DateTime.Now.ToString("o"),
        };
    }

    public async Task LogoutAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found.");

        user.Token!.RefreshToken= string.Empty;
        user.Token.RefreshTokenExpiresIn= DateTime.MinValue;
        user.Token.AccesTokenExpiresIn = DateTime.MinValue;
        user.Token.AccessToken = string.Empty;
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<User>> RefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Token!.RefreshToken == refreshToken);
        if (user == null)
            throw new UnauthorizedAccessException("Ungültiger Refresh Token.");

        if (user.Token!.RefreshTokenExpiresIn < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh Token ist abgelaufen.");

        // Sliding expiration: neuen Refresh Token erzeugen
        user.Token.RefreshToken = _jwtService.GenerateRefreshToken();
        user.Token.RefreshTokenExpiresIn = DateTime.UtcNow.AddDays(30);
        await _context.SaveChangesAsync();

        return new ApiResponse<User>()
        {
            success = true,
            data = user,
            message = "Token refreshed successfully.",
            timeStamp = DateTime.Now.ToString("o"),
        };
    }

    public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    }

    public bool VerifyPassword(string password, byte[] passwordHash, byte[] passwordSalt)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt);
        var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(passwordHash);
    }
}