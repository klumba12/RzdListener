using System;
using System.Collections.Generic;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.Conversion
{
   public sealed class CachedConverter : IConverter
   {
      #region Fields

      private Dictionary<string, object> converters = new Dictionary<string, object>();
      private IConverter converter;

      #endregion

      #region Constructors

      public CachedConverter(IConverter converter)
      {
         Guard.ArgumentNotNull(converter, "converter");

         this.converter = converter;
      }

      #endregion

      #region IConverter Members

      public ConversionResult<TFrom, TTo> GetConverter<TFrom, TTo>()
      {
         return
             (ConversionResult<TFrom, TTo>)
                converters.Return(
                   GetExplicitId(typeof(TFrom), typeof(TTo)),
                   () => converter.GetConverter<TFrom, TTo>());
      }

      public ConversionResult GetConverter(Type from, Type to)
      {
         return
            (ConversionResult)
               converters.Return(
                  GetImplicitId(from, to),
                  () => converter.GetConverter(from, to));
      }

      public bool IsConvertible(Type from, Type to)
      {
         return converter.IsConvertible(from, to);
      }

      #endregion

      #region Private Methods
   
      private static string GetExplicitId(Type from, Type to)
      {
         return string.Format("{0}Exp{1}", from.Name, to.Name);
      }

      private static string GetImplicitId(Type from, Type to)
      {
         return string.Format("{0}Imp{1}", from, to);
      }

      #endregion
   }
}