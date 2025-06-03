namespace Backend.Models;

public class LegalRestrictions
{
    public Guid Id { get; set; }
    public string Category { get; set; } = null!;
    public List<string> Rules { get; set; } = new();
}