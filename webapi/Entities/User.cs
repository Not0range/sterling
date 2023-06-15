using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Toolbelt.ComponentModel.DataAnnotations.Schema.V5;

namespace webapi.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }
        [IndexColumn, Required]
        public string Username { get; set; }
        [IndexColumn, Required]
        public string Email { get; set; }
        [IndexColumn, Required]
        public string Phone { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string Name { get; set; }
        public UserRole Role { get; set; }
    }
    public enum UserRole : byte
    {
        User,
        Admin
    }
}