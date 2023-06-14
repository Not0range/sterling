namespace webapi.Models.ProductModels
{
    public class CartItemFull
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string GroupTitle { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public int Count { get; set; }
    }
}
