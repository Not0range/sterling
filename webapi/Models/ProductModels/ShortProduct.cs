namespace webapi.Models.ProductModels
{
    public class ShortProduct
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Cart { get; set; }
    }
}
