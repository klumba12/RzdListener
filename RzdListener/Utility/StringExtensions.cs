using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using RzdListener.Infrastructure;
using System.Text;

namespace RzdListener.Utility
{
   public static class StringExtensions
   {
      public static string FormatWith(this string self, params object[] parameters)
      {
         return string.Format(CultureInfo.InvariantCulture, self, parameters);
      }


      public static string JoinWith(this IEnumerable<string> self, char separator)
      {
         return self.JoinWith(separator.ToString());
      }

      public static string JoinWith(this IEnumerable<string> self, string separator)
      {
         return self.JoinWith(separator, false);
      }

      public static string JoinWith(this IEnumerable<string> self, string separator, bool ignoreNulls)
      {
         Guard.ArgumentNotNull(self, "self");

         return
            ignoreNulls
               ? string.Join(separator, self.Where(s => s != null).ToArray())
               : string.Join(separator, self.ToArray());
      }


   }
}