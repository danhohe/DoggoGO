namespace Backend.Models;

public class Token
{
    public string AccessToken;
    public string RefreshToken;
    public DateTime AccesTokenExpiresIn;
    public DateTime RefreshTokenExpiresIn;
}