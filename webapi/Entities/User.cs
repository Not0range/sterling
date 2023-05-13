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
        [Required]
        public string Password { get; set; }
        [Required]
        public string Name { get; set; }
        [Column(TypeName = "date"), Required]
        public DateOnly BirthDate { get; set; }
        public UserRole Role { get; set; }
    }
    public enum UserRole : byte
    {
        User,
        Admin
    }
}