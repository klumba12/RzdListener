using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using RzdListener.Infrastructure;
using RzdListener.Utility;
using RzdListener.Conversion;

namespace RzdListener.CommandLine
{
   using ArgumentEntry = KeyValuePair<string, string>;
   
   public static class Processor
   {
      #region Public Methods

      public static Processor<T> Create<T>(Func<T> factory, IConverter converter)
      {
         return new Processor<T>(factory, converter);
      }

      public static Processor<T> Create<T>(IConverter converter) where T : new()
      {
         return new Processor<T>(() => new T(), converter);
      }

      #endregion
   }

   public sealed class Processor<T>
   {
      #region Fields

      private readonly Func<T> factory;
      private readonly IConverter converter;

      private readonly Regex flagExpression = new Regex("/(?<flag>.*[^:]$)");
      private readonly Regex optionExpression = new Regex("/(?<option>.*):$");

      #endregion

      #region Constructors

      internal Processor(Func<T> factory, IConverter converter)
      {
         Guard.ArgumentNotNull(factory, "factory");
         Guard.ArgumentNotNull(converter, "converter");

         this.factory = factory;
         this.converter = converter;
      }

      #endregion

      #region Public Methods

      public T Map(IEnumerable<string> arguments)
      {
         Guard.ArgumentNotNull(arguments, "arguments");

         var instance = factory();
         if (null == instance)
            throw new InvalidOperationException(
               "Instance factory should return not null value");

         var lookup =
            FindProperties()
               .SelectMany(prop =>
                  new[]
                  {                       
                      new KeyValuePair<string, PropertyEntry>(prop.Attribute.Name, prop),
                      new KeyValuePair<string, PropertyEntry>(prop.Attribute.Shortcut, prop),
                  })
               .Where(entry => !string.IsNullOrEmpty(entry.Key))
               .ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.InvariantCultureIgnoreCase);

         foreach (var argument in ParseArguments(arguments))
         {
            PropertyEntry entry;
            if (!lookup.TryGetValue(argument.Key, out entry))
               throw new InvalidOperationException(
                  "Invalid argument '{0}', argument is not supported"
                     .FormatWith(argument.Key));

            var convert = 
               converter
                  .GetConverter(
                     typeof(string),
                     entry.Property.PropertyType);

            var result = convert(argument.Value);
            if (!result.HasValue)
               throw new InvalidOperationException(
                  "Invalid argument '{0}', value '{1}' has wrong format"
                     .FormatWith(argument.Key, argument.Value));

            entry.Property.SetValue(instance, result.Value, null);
         }

         return instance;
      }

      #endregion

      #region Private Methods

      private IEnumerable<ArgumentEntry> ParseArguments(IEnumerable<string> arguments)
      {
         using (var enumerator = arguments.GetEnumerator())
            while (enumerator.MoveNext())
            {
               var argument = enumerator.Current;
               var match = flagExpression.Match(argument);
               if (match.Success)
               {
                  yield return new ArgumentEntry(match.Groups["flag"].Value, bool.TrueString);
                  continue;
               }

               match = optionExpression.Match(argument);
               if (match.Success)
               {
                  if (!enumerator.MoveNext())
                     throw new InvalidOperationException(
                        "Invalid argument '{0}', value is not specified"
                           .FormatWith(argument));

                  yield return new ArgumentEntry(match.Groups["option"].Value, enumerator.Current);
                  continue;
               }

               throw new InvalidOperationException(
                  "Invalid argument '{0}', argument has wrong format"
                     .FormatWith(arguments));
            }
      }

      private static IEnumerable<PropertyEntry> FindProperties()
      {
         return
            typeof(T)
              .FindProperties(typeof(OptionAttribute))
              .Select(property => new PropertyEntry(property, property.FindAttribute<OptionAttribute>()));
      }

      #endregion

      #region Nested Types

      [DebuggerDisplay("Property = {Property}")]
      private sealed class PropertyEntry
      {
         public PropertyEntry(PropertyInfo property, OptionAttribute attribute)
         {
            Debug.Assert(null != property);
            Debug.Assert(null != attribute);

            Property = property;
            Attribute = attribute;
         }

         public PropertyInfo Property { get; private set; }
         public OptionAttribute Attribute { get; private set; }
      }

      #endregion
   }
}