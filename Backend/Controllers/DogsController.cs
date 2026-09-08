using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/dogs")]
[Authorize]
public class DogsController : ControllerBase
{
    private readonly DoggoContext _context;

    public DogsController(DoggoContext context)
    {
        _context = context;
    }

    private Guid CurrentOwnerId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/dogs
    [HttpGet]
    public async Task<IActionResult> GetDogs()
    {
        var dogs = await _context.Dogs
            .Where(d => d.OwnerId == CurrentOwnerId)
            .Include(d => d.Breed)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Age,
                d.BreedId,
                d.OwnerId,
                BreedName = d.Breed.BreedName
            })
            .ToListAsync();

        return Ok(new ApiResponse<object> { Success = true, Data = dogs });
    }

    // POST /api/dogs
    [HttpPost]
    public async Task<IActionResult> CreateDog([FromBody] CreateDogDto dto)
    {
        if (!await _context.Breeds.AnyAsync(b => b.Id == dto.BreedId))
            return BadRequest(new ApiResponse<string> { Success = false, Error = "Breed not found." });

        var dog = new Dog
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Age = dto.Age,
            BreedId = dto.BreedId,
            OwnerId = CurrentOwnerId
        };

        _context.Dogs.Add(dog);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDogs), new { id = dog.Id },
            new ApiResponse<object>
            {
                Success = true,
                Data = new { dog.Id, dog.Name, dog.Age, dog.BreedId, dog.OwnerId },
                Message = "Dog created."
            });
    }

    // PUT /api/dogs/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDog(Guid id, [FromBody] UpdateDogDto dto)
    {
        var dog = await _context.Dogs.FirstOrDefaultAsync(d => d.Id == id && d.OwnerId == CurrentOwnerId);
        if (dog == null)
            return NotFound(new ApiResponse<string> { Success = false, Error = "Dog not found." });

        if (dto.Name != null) dog.Name = dto.Name;
        if (dto.Age.HasValue) dog.Age = dto.Age.Value;
        if (dto.BreedId.HasValue)
        {
            if (!await _context.Breeds.AnyAsync(b => b.Id == dto.BreedId))
                return BadRequest(new ApiResponse<string> { Success = false, Error = "Breed not found." });
            dog.BreedId = dto.BreedId.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { dog.Id, dog.Name, dog.Age, dog.BreedId },
            Message = "Dog updated."
        });
    }

    // DELETE /api/dogs/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteDog(Guid id)
    {
        var dog = await _context.Dogs.FirstOrDefaultAsync(d => d.Id == id && d.OwnerId == CurrentOwnerId);
        if (dog == null)
            return NotFound(new ApiResponse<string> { Success = false, Error = "Dog not found." });

        _context.Dogs.Remove(dog);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string> { Success = true, Message = "Dog deleted." });
    }
}