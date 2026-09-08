using Backend.Models;

namespace Backend.Interfaces;

public interface IAuthService
{
    public Task<ApiResponse<User>> LoginAsync(string email, string password, string? username);
    public Task<ApiResponse<User>> RegisterAsync(string userName, string name, string email, string password);

    public Task LogoutAsync(string userId);
    public Task<ApiResponse<User>> RefreshTokenAsync(string refreshToken);
    public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt);
    public bool VerifyPassword(string password, byte[] passwordHash, byte[] passwordSalt);
}