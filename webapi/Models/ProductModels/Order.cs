namespace webapi.Models.ProductModels
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public OrderStatus Status { get; set; }
        public decimal TotalPrice { get; set; }
        public OrderItem[] Items { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public string GroupTitle { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public int Count { get; set; }
    }

    public enum OrderStatus
    {
        Pending,
        Canceled,
        Completed
    }
}
