using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class DoggoContext : DbContext
{
    public DoggoContext(DbContextOptions<DoggoContext> options): base(options)
    { }
    
    public DbSet<Dog> Dogs { get; set; }
    public DbSet<Owner> Owners { get; set; }
    public DbSet<Breed> Breeds { get; set; }
    public DbSet<LegalRestrictions> LegalRestrictions { get; set; }
    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dog>()
            .HasOne(d => d.Owner)
            .WithMany(o => o.Dogs)
            .HasForeignKey(d => d.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Dog>()
            .HasOne(d => d.Breed)
            .WithMany()
            .HasForeignKey(d => d.BreedId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Owner>()
            .HasIndex(o => o.Email)
            .IsUnique();

        modelBuilder.Entity<Owner>()
            .Property(o => o.PhoneNumber)
            .IsRequired(false);
        
        modelBuilder.Entity<Breed>()
            .HasOne(b => b.LegalRestrictions)
            .WithMany()
            .HasForeignKey(b => b.LegalRestrictionsId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}