namespace Backend.Models;

public class Owner
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public string? PhoneNumber { get; set; } = null!;
    
    // Navigation property for related Dogs
    public ICollection<Dog> Dogs { get; set; } = new List<Dog>();
}