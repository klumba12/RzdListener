using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.Utility
{
   public static class ExpressionExtensions
   {

      public static Maybe<T> FindMember<T>(this Expression self) where T : MemberInfo
      {
         Guard.ArgumentNotNull(self, "self");

         var result =
            (self as MemberExpression)
               .ToMaybe()
               .Bind(expr => expr.Member as T);

         if (!result.HasValue)
            result =
               (self as LambdaExpression)
                   .ToMaybe()
                   .Bind(expr => expr.Body as MemberExpression)
                   .Bind(expr => expr.Member as T);

         return result;
      }

      public static T GetMember<T>(this Expression self) where T : MemberInfo
      {
         Guard.ArgumentNotNull(self, "self");

         var result = FindMember<T>(self);
         if (!result.HasValue)
            throw new ArgumentException(
                "Can't extract member of type '{0}' from expression '{1}'"
                   .FormatWith(typeof(T), self));

         return result.Value;
      }

      public static Maybe<MethodInfo> FindMethod(this Expression self)
      {
         Guard.ArgumentNotNull(self, "self");

         var result =
            (self as MethodCallExpression)
               .ToMaybe()
               .Bind(expr => expr.Method);

         if (!result.HasValue)
            result =
                (self as LambdaExpression)
                   .ToMaybe()
                   .Bind(expr => expr.Body as MethodCallExpression)
                   .Bind(expr => expr.Method);

         return result;
      }



   }
}