using System;
using System.Linq.Expressions;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.Conversion
{
   public sealed class Converter : IConverter
   {
      #region Fields

      private readonly ConvertMethodExtractor extractor;

      #endregion

      #region Constructors

      public Converter(object strategy)
      {
         Guard.ArgumentNotNull(strategy, "strategy");

         extractor = new ConvertMethodExtractor(strategy);
      }

      public Converter()
         : this(new ConvertStrategy())
      {
      }

      #endregion

      #region IConverter Members

      public bool IsConvertible<TFrom, TTo>()
      {
         return IsConvertible(typeof(TFrom), typeof(TTo));
      }

      public bool IsConvertible(Type from, Type to)
      {
         Guard.ArgumentNotNull(from, "from");
         Guard.ArgumentNotNull(to, "to");

         from = from.Drop(typeof(Nullable<>));
         to = from.Drop(typeof(Nullable<>));
         return null != extractor.Extract(from, to);
      }

      public ConversionResult<TFrom, TTo> GetConverter<TFrom, TTo>()
      {
         return new ConvertTo<TFrom, TTo>(extractor).CreateExplicitConverter();
      }

      public ConversionResult GetConverter(Type from, Type to)
      {
         Guard.ArgumentNotNull(from, "from");
         Guard.ArgumentNotNull(to, "to");

         var convertTo =
            typeof(ConvertTo<,>)
               .MakeGenericType(from, to);
         
         var ctor = 
            convertTo
               .GetConstructor(new [] { typeof(ConvertMethodExtractor) });

         if (null == ctor)
            throw new InvalidOperationException(
               "Constructor is not found {0}"
                  .FormatWith(typeof(ConvertMethodExtractor)));

         var createMethod =
            Expression.Lambda(
               Expression.Call(
                  Expression.New(
                     ctor, Expression.Constant(extractor, typeof(ConvertMethodExtractor))),
               "CreateImplicitConverter", new Type[] { }))
           .Compile();

         var convertMethod =
            createMethod.DynamicInvoke();

         var fromParameter = Expression.Parameter(typeof(object), "fromParameter");
         var formatParameter = Expression.Parameter(typeof(string), "formatParameter");

         return
            Expression
               .Lambda<ConversionResult>(
                  Expression.Call(
                     Expression.Constant(convertMethod),
                     convertMethod.GetType().GetMethod("Invoke"), fromParameter, formatParameter),
                  fromParameter, formatParameter)
               .Compile();
      }

      #endregion     
   }
}
