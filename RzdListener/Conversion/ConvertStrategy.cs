using System;
using System.Globalization;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.Conversion
{
   public class ConvertStrategy
   {
      #region Constructors

      public ConvertStrategy()
      {
      }

      #endregion

      #region Public Methods

      public virtual Maybe<String> ToString(Object value)
      {        
         if (null == value)
            return Maybe<string>.Nothing;

         return value.ToString().ToMaybe();
      }

      public virtual Maybe<SByte> ToSByte(String value)
      {
         SByte result;
         if (SByte.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<SByte>.Nothing;
      }

      public virtual Maybe<Byte> ToByte(String value)
      {
         Byte result;
         if (Byte.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Byte>.Nothing;
      }

      public virtual Maybe<Int16> ToInt16(String value)
      {
         Int16 result;
         if (Int16.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Int16>.Nothing;
      }

      public virtual Maybe<Int32> ToInt32(String value)
      {
         Int32 result;
         if (Int32.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Int32>.Nothing;
      }

      public virtual Maybe<UInt32> ToUInt32(String value)
      {
         UInt32 result;
         if (UInt32.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<UInt32>.Nothing;
      }

      public virtual Maybe<Int64> ToInt64(String value)
      {
         Int64 result;
         if (Int64.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Int64>.Nothing;
      }

      public virtual Maybe<UInt64> ToUInt64(String value)
      {
         UInt64 result;
         if (UInt64.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<UInt64>.Nothing;
      }

      public virtual Maybe<Single> ToSingle(String value)
      {
         Single result;
         if (Single.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Single>.Nothing;
      }

      public virtual Maybe<Double> ToDouble(String value)
      {
         Double result;
         if (Double.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Double>.Nothing;
      }

      public virtual Maybe<Decimal> ToDecimal(String value)
      {
         Decimal result;
         if (Decimal.TryParse(TruncateWhiteSpaces(value), NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return result.ToMaybe();

         return Maybe<Decimal>.Nothing;
      }

      public Maybe<DateTime> ToDateTime(String value)
      {
         DateTime result;
         if (DateTime.TryParse(value, out result))
            return result.ToMaybe();

         return Maybe<DateTime>.Nothing;
      }    

      public Maybe<Boolean> ToBoolean(String value)
      {
         if (string.Equals(value, "yes", StringComparison.InvariantCultureIgnoreCase))
            return true.ToMaybe();

         if (string.Equals(value, "no", StringComparison.InvariantCultureIgnoreCase))
            return false.ToMaybe();

         bool result;
         if (Boolean.TryParse(value, out result))
            return result.ToMaybe();

         return Maybe<bool>.Nothing;
      }    

      #endregion

      #region Private Methods

      private static string TruncateWhiteSpaces(string value)
      {
         return value.Replace(" ", string.Empty);
      }

      #endregion
   }
}