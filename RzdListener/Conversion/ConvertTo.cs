using System;
using System.Linq.Expressions;
using System.Reflection;
using RzdListener.Utility;
using RzdListener.Infrastructure;
using System.Linq;

namespace RzdListener.Conversion
{
   internal sealed class ConvertTo<TFrom, TTo>
   {
      #region Fields

      private readonly ConvertMethodExtractor extractor;

      #endregion

      #region Constructors

      public ConvertTo(ConvertMethodExtractor extractor)
      {
         Guard.ArgumentNotNull(extractor, "extractor");

         this.extractor = extractor;
      }

      #endregion

      #region Public Methods

      public ConversionResult<TFrom, TTo> CreateExplicitConverter()
      {
         var from = typeof(TFrom);
         var to = typeof(TTo);

         if (from == to)
            return CreatePacker(to);

         return CreateConverter().Compile();
      }

      public ConversionResult CreateImplicitConverter()
      {
         var from = typeof(TFrom);
         var to = typeof(TTo);
         if (from == to.Drop(typeof(Nullable<>)))
         {
            var packer = CreatePacker(to);
            return
               (value, format) =>
               {
                  var maybe = packer((TFrom)value);
                  return new Maybe<object>(maybe.Value, maybe.HasValue);
               };
         }

         var convert = CreateConverter().Compile();
         return
            (value, format) =>
            {
               var result = convert((TFrom)value, format);
               if (result.HasValue)
                  return result.Value.ToMaybe<object>();

               return Maybe<object>.Nothing;
            };

      }

      #endregion

      #region Private Methods

      private Expression<ConversionResult<TFrom, TTo>> CreateConverter()
      {
         var from = typeof(TFrom);
         var to = typeof(TTo);

         var convertMethod = GetConvertMethod();
         var withFormatParameter = convertMethod.GetParameters().Length == 2;

         var fromParameter = Expression.Parameter(from, "fromParameter");
         var formatParameter = Expression.Parameter(typeof(string), "formatParameter");

         var convertCall =
            Expression.Call(
               Expression.Constant(extractor.Strategy),
                  convertMethod,
                  withFormatParameter
                     ? new[] { fromParameter, formatParameter }
                     : new[] { fromParameter });

         if (typeof(TTo).IsUnitOf(typeof(Nullable<>)))
         {
            var notNullableTo = to.Drop(typeof(Nullable<>));
            var nullableWrap =
               typeof(ConvertTo<TFrom, TTo>)
                 .GetMethod("CreateNullableWrapper", BindingFlags.Static | BindingFlags.NonPublic)
                 .MakeGenericMethod(notNullableTo)
                 .Invoke(null, null);

            var nullableWrapCall =
               Expression.Call(
                     Expression.Constant(nullableWrap),
                     nullableWrap.GetType().GetMethod("Invoke"),
                     new Expression[]
                     {
                        Expression.Lambda(
                           typeof(ConversionResult<,>).MakeGenericType(from, notNullableTo),
                           convertCall,
                           fromParameter,
                           formatParameter)
                     });
            return
               Expression.Lambda<ConversionResult<TFrom, TTo>>(
                  Expression.Invoke(nullableWrapCall, fromParameter, formatParameter),
                  fromParameter,
                  formatParameter);
         }

         return Expression.Lambda<ConversionResult<TFrom, TTo>>(convertCall, fromParameter, formatParameter);
      }

      private static Func<ConversionResult<TFrom, TNotNullableTo>, ConversionResult<TFrom, TTo>> CreateNullableWrapper<TNotNullableTo>()
      {
         return
            convert =>
               (parameter, format) =>
               {
                  if (!ReferenceEquals(parameter, null))
                  {
                     var result = convert(parameter, format);
                     if (result.HasValue)
                        return ((TTo)(object)result.Value).ToMaybe();
                  }

                  return Maybe<TTo>.Nothing;
               };
      }

      private MethodInfo GetConvertMethod()
      {
         var from = typeof(TFrom);
         var to = typeof(TTo).Drop(typeof(Nullable<>));

         var convertMethod = extractor.Extract(from, to);
         if (null == convertMethod)
            throw new InvalidOperationException(
               "Converter from '{0}' to '{1}' is not found"
                  .FormatWith(from, to));

         return convertMethod;
      }

      private ConversionResult<TFrom, TTo> CreatePacker(Type type)
      {
         //
         // TODO: make expression version without boxing/unboxing
         //

         return
            (value, format) =>
            {
               var refValue = (object)value;
               return ((TTo)refValue).ToMaybe();
            };
      }

      #endregion
   }
}