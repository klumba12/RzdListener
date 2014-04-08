using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RzdListener.CommandLine;

namespace RzdListener
{
   public class Options
   {
      public Options() 
      {
         Timeout = 60;
         Seats = 1;
      }

      [Option(Name = "station1", Shortcut = "st1")]
      public string Station1 { get; set; }

      [Option(Name = "station2", Shortcut = "st2")]
      public string Station2 { get; set; }

      [Option(Name = "date1", Shortcut = "d1")]
      public string Date1 { get; set; }

      [Option(Name = "date2", Shortcut = "d2")]
      public string Date2 { get; set; }

      [Option(Name = "seats", Shortcut = "s")]
      public int Seats { get; set; }

      [Option(Name = "timeout", Shortcut = "t")]
      public int Timeout { get; set; }

      [Option(Name = "help", Shortcut = "h")]
      public bool ShowHelp { get; set; }

      [Option(Name = "query", Shortcut = "q")]
      public string Query { get; set; }
   }
}
