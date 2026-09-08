namespace Backend.Models;

public class User
{
    public User(byte[] passwordHash, byte[] passwordSalt)
    {
        Id = Guid.NewGuid();
        PasswordHash = passwordHash;
        PasswordSalt = passwordSalt;
        CreatedAt = DateTime.UtcNow.ToString("o");
    }
    
    public Guid Id;
    public string UserName;
    public string Name;
    public string Email;
    public bool IsActive = true;
    public string CreatedAt;
    public string UpdatedAt;
    public Token? Token;
    private byte[] PasswordHash { get; }
    private byte[] PasswordSalt { get; }

    public byte[] GetPasswordHash()
    {
        return PasswordHash;
    }

    public byte[] GetPasswordSalt()
    {
        return PasswordSalt;
    }
    
}