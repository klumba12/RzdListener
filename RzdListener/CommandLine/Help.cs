using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using RzdListener.Infrastructure;
using RzdListener.Utility;

namespace RzdListener.CommandLine
{
   public sealed class Help<T>
   {
      #region Constructors

      public Help()
      {
      }

      #endregion

      #region Public Methods

      public string GetDescription<TProperty>(Expression<Func<T, TProperty>> expression)
      {
         Guard.ArgumentNotNull(expression, "expression");

         return GetDescription(expression.GetMember<PropertyInfo>());
      }

      public string GetDescription()
      { 
         return 
            typeof(T)
               .FindProperties(typeof(OptionAttribute))
               .Select(property => GetDescription(property))
               .JoinWith(Environment.NewLine);
      }

      #endregion

      #region Private Methods

      private static string GetDescription(PropertyInfo property)
      {
         var attribute = property.FindAttribute<OptionAttribute>();

         if (null == attribute)
            throw new InvalidOperationException(
               "Invalid property '{0}', is not marked with '{1}'"
                  .FormatWith(property.Name, typeof(OptionAttribute)));

         var builder = new StringBuilder();
         if(!string.IsNullOrEmpty(attribute.Name))
            builder.Append("/").Append(attribute.Name);

         if(!string.IsNullOrEmpty(attribute.Shortcut))
            builder.Append("[/").Append(attribute.Shortcut).Append("]");

         if(!string.IsNullOrEmpty(attribute.Description))
            builder.Append(" - ").Append(attribute.Description);

         return builder.ToString();
      }

      #endregion
   }
}