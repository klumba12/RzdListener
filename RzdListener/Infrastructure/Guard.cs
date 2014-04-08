using System;
using System.Diagnostics;

namespace RzdListener.Infrastructure
{
   public static class Guard
   {
      [DebuggerStepThrough]
      public static void ArgumentNotNull(object argumentValue, string argumentName)
      {
         if (null == argumentValue) 
            throw new ArgumentNullException(argumentName);
      }    

      [DebuggerStepThrough]
      public static void ArgumentNotNullOrEmpty(string argumentValue, string argumentName)
      {
         if (string.IsNullOrEmpty(argumentValue)) 
            throw new ArgumentException(argumentName);
      }
   }
}