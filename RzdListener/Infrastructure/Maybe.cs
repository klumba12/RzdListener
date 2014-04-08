using System;

namespace RzdListener.Infrastructure
{
   public interface IMaybe
   {
      object Value { get; }
      bool HasValue { get; }
   }

   public sealed class Maybe<T> : IMaybe, IEquatable<Maybe<T>>
   {
      #region Fields

      public static readonly Maybe<T> Nothing = new Maybe<T>(default(T), false);

      #endregion

      #region Constructors

      public Maybe(T value)
         : this(value, null != value)
      {
      }

      public Maybe(T value, bool hasValue)
      {
         Value = value;
         HasValue = hasValue;
      }

      #endregion

      #region Public Properties

      public T Value
      {
         get;
         private set;
      }

      public bool HasValue
      {
         get;
         private set;
      }

      public bool Equals(Maybe<T> other)
      {
         if (null == other) return false;

         return object.Equals(Value, other.Value);
      }

      object IMaybe.Value
      {
         get { return Value; }
      }

      #endregion
   }
}