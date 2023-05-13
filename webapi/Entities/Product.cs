using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Toolbelt.ComponentModel.DataAnnotations.Schema.V5;

namespace webapi.Entities
{
    [Table("Products")]
    public class Product
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }
        public ProductGroup Group { get; set; }
        [IndexColumn, Required]
        public string Title { get; set; }
        [Required]
        public decimal Price { get; set; }
        public byte[] Image { get; set; }
    }
}
