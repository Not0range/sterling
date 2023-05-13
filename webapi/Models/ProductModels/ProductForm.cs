using System.ComponentModel.DataAnnotations;

namespace webapi.Models.ProductModels
{
    public class ProductForm
    {
        public int? CategoryId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public IEnumerable<ProductTypeForm> Types { get; set; }

        public bool IsValid()
        {
            if (!CategoryId.HasValue ||
                string.IsNullOrWhiteSpace(Title) || 
                string.IsNullOrWhiteSpace(Description) || 
                Types == null) return false;
            return true;
        }
    }

    public class ProductTypeForm
    {
        public int? Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public decimal Price { get; set; }
    }
}
