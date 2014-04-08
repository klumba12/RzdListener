using System;
using System.Linq;
using System.Reflection;
using RzdListener.Utility;
using RzdListener.Infrastructure;

namespace RzdListener.Conversion
{
   internal sealed class ConvertMethodExtractor
   {
      #region Constructors

      public ConvertMethodExtractor(object strategy)
      {
         Guard.ArgumentNotNull(strategy, "strategy");

         Strategy = strategy;
      }

      #endregion

      #region Public Properties

      public object Strategy { get; private set; }

      #endregion

      #region Public Methods

      public MethodInfo Extract(Type from, Type to)
      {
         Guard.ArgumentNotNull(from, "from");
         Guard.ArgumentNotNull(to, "to");

         var methods = 
            Strategy
               .GetType()
               .GetMethods(BindingFlags.Instance | BindingFlags.Public)               
               .ToArray();

         return
            methods   
               .FirstOrDefault(m =>
                  m.Name.Equals("To" + to.Name, StringComparison.InvariantCultureIgnoreCase) &&
                     HasSuitableFormatSignature(m, from, to)) ??
            methods
               .FirstOrDefault(m =>
                  m.Name.Equals("To" + to.Name, StringComparison.InvariantCultureIgnoreCase) &&
                     HasSuitableSignature(m, from, to));
      }

      public MethodInfo Extract<TFrom, TTo>()
      {
         return Extract(typeof(TFrom), typeof(TTo));
      }

      #endregion

      #region Private Methods

      private static bool HasSuitableFormatSignature(MethodInfo info, Type from, Type to)
      {
         var expectedReturnType = typeof(Maybe<>).MakeGenericType(to);
         if (info.ReturnType != expectedReturnType)
            return false;

         var parameters = info.GetParameters();
         if (parameters.Length != 2)
            return false;

         var fromParameter = parameters[0];
         var formatParameter = parameters[1];
         if ((fromParameter.ParameterType != from ||
               fromParameter.ParameterType.IsByRef) &&
                  formatParameter.ParameterType != typeof(string))
            return false;

         return true;
      }


      private static bool HasSuitableSignature(MethodInfo info, Type from, Type to)
      {
         var expectedReturnType = typeof(Maybe<>).MakeGenericType(to);
         if (info.ReturnType != expectedReturnType)
            return false;

         var parameters = info.GetParameters();
         if (parameters.Length != 1)
            return false;

         var fromParameter = parameters[0];
         if (fromParameter.ParameterType != from ||
               fromParameter.ParameterType.IsByRef)
            return false;

         return true;
      }

      #endregion
   }
}