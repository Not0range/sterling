namespace webapi.Models.ProductModels
{
    public class Product
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Category { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public IEnumerable<ProductType> Types { get; set; }
        public bool Favorite { get; set; }
    }

    public class ProductType
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public int Cart { get; set; }
        public bool Image { get; set; }
    }
}
