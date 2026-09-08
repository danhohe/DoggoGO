namespace Backend.DTOs;

public class CreateDogDto
{
    public string Name { get; set; } = null!;
    public int Age { get; set; }
    public Guid BreedId { get; set; }
}