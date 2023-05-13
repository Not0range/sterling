using Microsoft.EntityFrameworkCore;

using webapi.Entities;

namespace webapi
{
    public class SterlingContext : DbContext
    {
        public SterlingContext(): base() { }
        public SterlingContext(DbContextOptions<SterlingContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductGroup> ProductGroups { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
