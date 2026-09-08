using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/breeds")]
public class BreedsController : ControllerBase
{
    private readonly DoggoContext _context;

    public BreedsController(DoggoContext context)
    {
        _context = context;
    }

    // GET /api/breeds
    [HttpGet]
    public async Task<IActionResult> GetBreeds()
    {
        var breeds = await _context.Breeds
            .Select(b => new { b.Id, b.BreedName, b.Description, b.LegalRestrictionsId })
            .ToListAsync();

        return Ok(new ApiResponse<object> { Success = true, Data = breeds });
    }

    // GET /api/breeds/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBreed(Guid id)
    {
        var breed = await _context.Breeds
            .Include(b => b.LegalRestrictions)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (breed == null)
            return NotFound(new ApiResponse<string> { Success = false, Error = "Breed not found." });

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new
            {
                breed.Id,
                breed.BreedName,
                breed.Description,
                LegalRestrictions = new
                {
                    breed.LegalRestrictions.Id,
                    breed.LegalRestrictions.Category,
                    breed.LegalRestrictions.Rules
                }
            }
        });
    }
}