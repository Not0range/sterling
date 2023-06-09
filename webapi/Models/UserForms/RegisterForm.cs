﻿using System.ComponentModel.DataAnnotations;

namespace webapi.Models.UserForms
{
    public class RegisterForm
    {
        [Required, MinLength(5), MaxLength(20)]
        public string Username { get; set; }
        [Required, MinLength(1), MaxLength(50)]
        public string Name { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required, RegularExpression(@"^77\d{6}$")]
        public string Phone { get; set; }
        [Required, MinLength(5), MaxLength(20)]
        public string Password { get; set; }
    }
}
