using System;

namespace RzdListener.CommandLine
{
   public sealed class OptionAttribute : Attribute
   {
      #region Fields

      public OptionAttribute()
      {
      }

      #endregion

      #region Public Properties

      public string Name { get; set; }
      public string Shortcut { get; set; }
      public string Description { get; set; }
      public bool IsInformative { get; set; }

      #endregion
   }
}