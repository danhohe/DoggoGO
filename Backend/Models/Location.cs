namespace Backend.Models;

public class Location
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Category { get; set; } = null!;
}