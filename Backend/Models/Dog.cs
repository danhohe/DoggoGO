namespace Backend.Models;

public class Dog
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Age { get; set; }
    public Guid BreedId { get; set; }
    public Guid OwnerId { get; set; }
    
    // Navigation property for the owner and breed
    public Owner Owner { get; set; } = null!;
    public Breed Breed { get; set; } = null!;
}