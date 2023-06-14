namespace webapi.Models.ProductModels
{
    public class SearchParams
    {
        public SortType Sort { get; set; }
    }

    public enum SortType
    {
        AzAsc,
        AzDesc,
        PriceAsc,
        PriceDesc,
    }
}
