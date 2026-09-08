using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/locations")]
public class LocationsController : ControllerBase
{
    private readonly DoggoContext _context;

    public LocationsController(DoggoContext context)
    {
        _context = context;
    }

    // GET /api/locations
    // Optional: ?category=freilaufwiese
    [HttpGet]
    public async Task<IActionResult> GetLocations([FromQuery] string? category)
    {
        var query = _context.Locations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(l => l.Category == category);

        var locations = await query
            .Select(l => new { l.Id, l.Name, l.Latitude, l.Longitude, l.Category })
            .ToListAsync();

        return Ok(new ApiResponse<object> { Success = true, Data = locations });
    }
}