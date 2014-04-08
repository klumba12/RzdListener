using System;
using RzdListener.Infrastructure;

namespace RzdListener.Utility
{
   public static class MaybeExtensions
   {
      #region Public Methods

      public static Maybe<T> ToMaybe<T>(this T value)
      {
         return new Maybe<T>(value);
      }

      public static Maybe<U> Bind<T, U>(this Maybe<T> maybe, Func<T, Maybe<U>> evaluate)
      {
         Guard.ArgumentNotNull(maybe, "maybe");
         Guard.ArgumentNotNull(evaluate, "evaluate");

         return maybe.HasValue ? evaluate(maybe.Value) : Maybe<U>.Nothing;
      }

      public static Maybe<U> Bind<T, U>(this Maybe<T> maybe, Func<T, U> evaluate)
      {
         Guard.ArgumentNotNull(maybe, "maybe");
         Guard.ArgumentNotNull(evaluate, "evaluate");

         return maybe.Bind(result => new Maybe<U>(evaluate(result)));
      }

      public static U Return<T, U>(this Maybe<T> maybe, Func<T, U> evaluate, Func<U> @default)
      {
         Guard.ArgumentNotNull(maybe, "maybe");
         Guard.ArgumentNotNull(evaluate, "evaluate");
         Guard.ArgumentNotNull(@default, "@default");

         return maybe.HasValue ? evaluate(maybe.Value) : @default();
      }

      public static U Return<T, U>(this Maybe<T> maybe, Func<T, U> evaluate)
      {
         Guard.ArgumentNotNull(maybe, "maybe");
         Guard.ArgumentNotNull(evaluate, "evaluate");

         return maybe.Return(evaluate, () => default(U));
      }

      #endregion
   }
}