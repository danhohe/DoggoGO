using DoggoGOBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DoggoGOBackend.Data;

public class DoggoGODbContext : DbContext
{
    public DoggoGODbContext(DbContextOptions<DoggoGODbContext> options) : base(options)
    { }

    public DbSet<DogRace> Dogs => Set<DogRace>();
    public DbSet<Right> Rights => Set<Right>();
}