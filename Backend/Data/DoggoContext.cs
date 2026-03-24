using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class DoggoContext : DbContext
{
    public DoggoContext(DbContextOptions<DoggoContext> options): base(options)
    { }
    
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
    }
}