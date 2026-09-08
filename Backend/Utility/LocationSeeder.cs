using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Models;

namespace Backend.Utility;

public class LocationSeeder
{
    private class LocationJson
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }

        [JsonPropertyName("category")]
        public string Category { get; set; } = null!;
    }

    public static async Task SeedLocationsAsync(DoggoContext context, string jsonFilePath)
    {
        if (context.Locations.Any()) return;

        var jsonData = await File.ReadAllTextAsync(jsonFilePath);
        var items = JsonSerializer.Deserialize<List<LocationJson>>(jsonData);

        if (items == null) return;

        var locations = items.Select(item => new Location
        {
            Id = Guid.NewGuid(),
            Name = item.Name,
            Latitude = item.Latitude,
            Longitude = item.Longitude,
            Category = item.Category
        }).ToList();

        await context.Locations.AddRangeAsync(locations);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {locations.Count} locations successfully.");
    }
}