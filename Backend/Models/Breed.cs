namespace Backend.Models;

public class Breed
{
    public Guid Id { get; set; }
    public string BreedName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Guid LegalRestrictionsId { get; set; }
    public LegalRestrictions LegalRestrictions { get; set; } = null!;
}