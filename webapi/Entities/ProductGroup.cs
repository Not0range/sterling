using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Toolbelt.ComponentModel.DataAnnotations.Schema.V5;

namespace webapi.Entities
{
    [Table("ProductGroups")]
    public class ProductGroup
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Category))]
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        [IndexColumn, Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [InverseProperty(nameof(Product.Group))]
        public List<Product> Products { get; set; }
    }
}
