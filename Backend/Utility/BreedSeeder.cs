using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Models;

namespace Backend.Utility;

public class BreedSeeder
{
    // DTOs that match the JSON structure exactly
    private class BreedJson
    {
        [JsonPropertyName("breedName")]
        public string BreedName { get; set; } = null!;

        [JsonPropertyName("description")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("legal_restrictions")]
        public LegalRestrictionsJson LegalRestrictions { get; set; } = null!;
    }

    private class LegalRestrictionsJson
    {
        [JsonPropertyName("category")]
        public string Category { get; set; } = null!;

        [JsonPropertyName("rules")]
        public List<string> Rules { get; set; } = new();
    }

    public static async Task SeedBreedsAsync(DoggoContext context, string jsonFilePath)
    {
        if (context.Breeds.Any()) return;

        var jsonData = await File.ReadAllTextAsync(jsonFilePath);
        var breedJsonList = JsonSerializer.Deserialize<List<BreedJson>>(jsonData);

        if (breedJsonList == null) return;

        // Build entities with proper IDs and FK relationships
        var legalRestrictions = new List<LegalRestrictions>();
        var breeds = new List<Breed>();

        foreach (var item in breedJsonList)
        {
            var legal = new LegalRestrictions
            {
                Id = Guid.NewGuid(),
                Category = item.LegalRestrictions.Category,
                Rules = item.LegalRestrictions.Rules
            };
            legalRestrictions.Add(legal);

            breeds.Add(new Breed
            {
                Id = Guid.NewGuid(),
                BreedName = item.BreedName,
                Description = item.Description,
                LegalRestrictionsId = legal.Id
            });
        }

        // Insert LegalRestrictions first (FK dependency), then Breeds
        await context.LegalRestrictions.AddRangeAsync(legalRestrictions);
        await context.SaveChangesAsync();

        await context.Breeds.AddRangeAsync(breeds);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {breeds.Count} breeds successfully.");
    }
}