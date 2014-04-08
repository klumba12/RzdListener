using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.CommandLine
{
   public sealed class Information
   {
      #region Constructors

      public Information()
      {
      }

      #endregion

      #region Public Methods

      public IEnumerable<string> Get<T>(T options)
      {
         Guard.ArgumentNotNull(options, "options");

         return
            typeof(T)
               .FindProperties(typeof(OptionAttribute))
               .Select(property => GetText(options, property))
               .Where(info => null != info);
      }

      public IEnumerable<string> Get<T>(T[] options)
      {
         Guard.ArgumentNotNull(options, "options");

         var properties =
            typeof(T)
            .FindProperties(typeof(OptionAttribute))
            .ToArray();

         return
            options
               .SelectMany(opt =>
                  properties
                     .Select((property, i) =>
                        new
                        {
                           Index = i,
                           Property = property,
                           Value = GetValue(opt, property),
                        })
                     .Where(property => null != property.Value))
               .GroupBy(entry => entry.Property.Name)
               .OrderBy(group => group.First().Index)
               .Select(group => GetText(group.First().Property, group.Select(entry => entry.Value).ToArray()))
               .Where(info => null != info);
      }


      #endregion

      #region Private Methods

      private object GetValue<T>(T options, PropertyInfo property)
      {
         var attribute = property.FindAttribute<OptionAttribute>();

         if (null == attribute)
            throw new InvalidOperationException(
               "Invalid property '{0}', is not marked with '{1}'"
                  .FormatWith(property.Name, typeof(OptionAttribute)));

         if (!attribute.IsInformative)
            return null;

         return property.GetValue(options);
      }

      private string GetText<T>(T options, PropertyInfo property)
      {
         var attribute = property.FindAttribute<OptionAttribute>();

         if (null == attribute)
            throw new InvalidOperationException(
               "Invalid property '{0}', is not marked with '{1}'"
                  .FormatWith(property.Name, typeof(OptionAttribute)));

         if (!attribute.IsInformative)
            return null;

         var value = property.GetValue(options);
         if (null == value)
            return null;

         if (property.PropertyType == typeof(bool) && (!(bool)value))
            return null;

         return "/{0} - {1}"
            .FormatWith(
               attribute.Name,
               property.GetValue(options));
      }

      private string GetText(PropertyInfo property, object[] values)
      {
         if (values.Length == 0)
            return null;

         var attribute = property.FindAttribute<OptionAttribute>();

         if (null == attribute)
            throw new InvalidOperationException(
               "Invalid property '{0}', is not marked with '{1}'"
                  .FormatWith(property.Name, typeof(OptionAttribute)));

         if (!attribute.IsInformative)
            return null;

         object aggregation = null;

         var propertyType = property.PropertyType.Drop(typeof(Nullable<>));
         if (propertyType == typeof(string))
         {
            aggregation =
               values
                  .Cast<string>()
                  .Distinct()
                  .JoinWith(", ", true);
         }
         else if (propertyType.IsNumeric())
         {
            var max =
               typeof(Enumerable)
                  .GetMethod("Max", new[] { typeof(IEnumerable<>).MakeGenericType(propertyType) });

            var cast =
               typeof(Enumerable)
                  .GetMethod("Cast")
                  .MakeGenericMethod(propertyType);

            aggregation =
               max.Invoke(
                  null,
                  new object[]
                  {
                     cast.Invoke(null, new object[]{values})
                  });
         }
         else if (propertyType == typeof(bool))
         {
            aggregation = values.Cast<bool>().Any(value => value);
         }
         else if (propertyType == typeof(DateTime))
         {
            aggregation = 
               values
                  .Cast<DateTime>()
                  .Max();
         }
         else
         {
            aggregation =
               values
                  .Where(value => null != value)
                  .Select(value => value.ToString())
                  .JoinWith(", ", true);
         }

         if (null != aggregation)
            return "/{0} - {1}"
               .FormatWith(
                  attribute.Name,
                  aggregation);

         return null;
      }

      #endregion
   }
}