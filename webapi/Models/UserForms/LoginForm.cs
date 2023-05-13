using System.ComponentModel.DataAnnotations;

namespace webapi.Models.UserForms
{
    public class LoginForm
    {
        [Required, MinLength(5)]
        public string Username { get; set; }
        [Required, MinLength(5)]
        public string Password { get; set; }
    }
}
