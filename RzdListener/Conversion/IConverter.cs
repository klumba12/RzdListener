using System;
using RzdListener.Infrastructure;

namespace RzdListener.Conversion
{
   public interface IConverter
   {
      ConversionResult<TFrom, TTo> GetConverter<TFrom, TTo>();
      ConversionResult GetConverter(Type from, Type to);
      bool IsConvertible(Type from, Type to);
   }

   public delegate Maybe<TTo> ConversionResult<TFrom, TTo>(TFrom from, string format = null);
   public delegate IMaybe ConversionResult(object from, string format = null);
}