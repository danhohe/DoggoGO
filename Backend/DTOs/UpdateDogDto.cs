namespace Backend.DTOs;

public class UpdateDogDto
{
    public string? Name { get; set; }
    public int? Age { get; set; }
    public Guid? BreedId { get; set; }
}