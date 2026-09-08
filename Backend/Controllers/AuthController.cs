using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(AuthService authService) : ControllerBase
{
    public Task<ApiResponse<User>> LoginAsync(string email, string password, string? username)
    {
        return authService.LoginAsync(email, password, username);
    }

    public Task<ApiResponse<User>> RegisterAsync(string email, string password, string? username, string name)
    {
        return authService.RegisterAsync(username = string.Empty, name, email, password);
    }
}