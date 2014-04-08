using System;
using System.Collections.Generic;
using RzdListener.Infrastructure;

namespace RzdListener.Utility
{
   public static class DictionaryExtensions
   {
      #region Public Methods

      public static TValue ReturnDefault<TKey, TValue>(this IDictionary<TKey, TValue> self, TKey key)
      {
         return self.Return(key, () => default(TValue));
      }

      public static TValue Return<TKey, TValue>(this IDictionary<TKey, TValue> self, TKey key) where TValue : new()
      {
         return self.Return(key, () => new TValue());
      }

      public static TValue Return<TKey, TValue>(this IDictionary<TKey, TValue> self, TKey key, Func<TValue> factory)
      {
         Guard.ArgumentNotNull(self, "self");
         Guard.ArgumentNotNull(key, "key");
         Guard.ArgumentNotNull(factory, "factory");

         TValue result;
         if (!self.TryGetValue(key, out result))
            result = self[key] = factory();

         return result;
      }

      public static void AddRange<TKey, TValue>(this IDictionary<TKey, TValue> self, IEnumerable<KeyValuePair<TKey, TValue>> items)
      {
         Guard.ArgumentNotNull(self, "self");
         Guard.ArgumentNotNull(items, "items");

         foreach (var item in items)
            self.Add(item);
      }

      #endregion
   }
}