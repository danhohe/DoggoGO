using System.Text.Json;
using Backend.Data;
using Backend.Models;

namespace Backend.Utility;

public class BreedSeeder
{
    public static async Task SeedBreedsAsync(DoggoContext context, string jsonFilePath)
    {
        if (context.Breeds.Any())
        {
            return; // Database already seeded
        }

        var jsonData = await File.ReadAllTextAsync(jsonFilePath);
        var breeds = JsonSerializer.Deserialize<List<Breed>>(jsonData, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (breeds != null)
        {
            await context.Breeds.AddRangeAsync(breeds);
            await context.SaveChangesAsync();
            Console.WriteLine("Breeds seeded successfully.");
        }
        else
        {
            Console.WriteLine("Failed to deserialize breeds from JSON.");
        }
    }
}