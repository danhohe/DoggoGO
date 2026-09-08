using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers;

[ApiController]
[Route("api/owners")]
public class OwnersController : ControllerBase
{
    private readonly DoggoContext _context;
    private readonly IConfiguration _configuration;

    public OwnersController(DoggoContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST /api/owners/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Owners.AnyAsync(o => o.Email == dto.Email))
            return Conflict(new ApiResponse<string> { Success = false, Error = "Email already in use." });

        using var hmac = new HMACSHA512();
        var owner = new Owner
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            PasswordSalt = hmac.Key,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            PhoneNumber = dto.PhoneNumber
        };

        _context.Owners.Add(owner);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOwner), new { id = owner.Id },
            new ApiResponse<object>
            {
                Success = true,
                Data = new { owner.Id, owner.Name, owner.Email },
                Message = "Registration successful."
            });
    }

    // POST /api/owners/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var owner = await _context.Owners.FirstOrDefaultAsync(o => o.Email == dto.Email);
        if (owner == null)
            return Unauthorized(new ApiResponse<string> { Success = false, Error = "Invalid credentials." });

        using var hmac = new HMACSHA512(owner.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
        if (!computedHash.SequenceEqual(owner.PasswordHash))
            return Unauthorized(new ApiResponse<string> { Success = false, Error = "Invalid credentials." });

        var token = GenerateJwtToken(owner);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { token },
            Message = "Login successful."
        });
    }

    // GET /api/owners/{id}
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetOwner(Guid id)
    {
        var requestingId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (requestingId != id)
            return Forbid();

        var owner = await _context.Owners
            .Include(o => o.Dogs)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (owner == null)
            return NotFound(new ApiResponse<string> { Success = false, Error = "Owner not found." });

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new
            {
                owner.Id,
                owner.Name,
                owner.Email,
                owner.PhoneNumber,
                Dogs = owner.Dogs.Select(d => new { d.Id, d.Name, d.Age, d.BreedId })
            }
        });
    }

    private string GenerateJwtToken(Owner owner)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, owner.Id.ToString()),
            new Claim(ClaimTypes.Email, owner.Email)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}