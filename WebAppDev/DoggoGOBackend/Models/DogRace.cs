namespace DoggoGOBackend.Models;

public class DogRace
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public Right[] Rights { get; set; }
}