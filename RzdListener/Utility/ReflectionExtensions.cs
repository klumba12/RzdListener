using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using RzdListener.Infrastructure;

namespace RzdListener.Utility
{
   public static class ReflectionExtensions
   {
      public static T FindAttribute<T>(this MemberInfo self)
      {
         Guard.ArgumentNotNull(self, "self");

         return (T)self.GetCustomAttributes(typeof(T), true).FirstOrDefault();
      }

      public static IEnumerable<PropertyInfo> FindProperties(this Type self, Type attributeType)
      {
         Guard.ArgumentNotNull(self, "self");
         Guard.ArgumentNotNull(attributeType, "attributeType");

         return
            self
               .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.GetProperty)
               .Where(propertyInfo => propertyInfo.GetCustomAttributes(attributeType, true).Any());
      }

      public static Type Drop(this Type self, Type dropType)
      {
         Guard.ArgumentNotNull(self, "self");
         Guard.ArgumentNotNull(dropType, "dropType");

         return
            self.IsUnitOf(dropType)
               ? self.GetGenericArguments()[0]
               : self;
      }

      public static bool IsUnitOf(this Type self, Type unitType)
      {
         Guard.ArgumentNotNull(self, "self");
         Guard.ArgumentNotNull(unitType, "unitType");

         return
            self.IsGenericType &&
            self.GetGenericTypeDefinition() == unitType;
      }

      public static bool IsNumeric(this Type self)
      {
         Guard.ArgumentNotNull(self, "self");

         self = self.Drop(typeof(Nullable<>));
         if (!self.IsEnum)
         {
            switch (Type.GetTypeCode(self))
            {
               case TypeCode.Char:
               case TypeCode.SByte:
               case TypeCode.Byte:
               case TypeCode.Int16:
               case TypeCode.UInt16:
               case TypeCode.Int32:
               case TypeCode.UInt32:
               case TypeCode.Int64:
               case TypeCode.UInt64:
               case TypeCode.Single:
               case TypeCode.Double:
                  return true;
            }
         }
         return false;
      }
   }
}