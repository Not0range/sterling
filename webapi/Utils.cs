using StackExchange.Redis;

namespace webapi
{
    public static class Utils
    {
        public static string Select(this string obj1, string obj2)
        {
            if (string.IsNullOrWhiteSpace(obj1)) return obj2;
            return obj1;
        }

        public static int Get(this RedisValue value, int replace)
        {
            if (value.HasValue) return (int)value;
            return replace;
        }
    }
}
