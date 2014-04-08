using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web.Script.Serialization;
using NLog;
using Noesis.Javascript;
using RzdListener.CommandLine;
using RzdListener.Conversion;
using RzdListener.Utility;

namespace RzdListener
{
   class Program
   {
      private static Logger logger = LogManager.GetCurrentClassLogger();

      [STAThread]
      static void Main(string[] args)
      {
         try
         {
            var options = ParseOptions(args);
            if (options.ShowHelp)
            {
               logger.Trace(new Help<Options>().GetDescription());
               return;
            }

            var query = GetQuery(options);
            logger.Info("{0} - {1}", query.Date1, query.Date2);
            logger.Info("{0}: {1}", query.Station1, query.Code1);
            logger.Info("{0}: {1}", query.Station2, query.Code2);

            Console.WriteLine();

            var timeout = TimeSpan.FromSeconds(options.Timeout);
            var isCanceled = false;
            do
            {
               try
               {
                  var session = GetSession(query);
                  var timetable = GetTimetable(query, session);
                  foreach (var table in timetable)
                  {
                     foreach (var list in table["list"])
                     {
                        logger.Info("{0}: {1}, {2} {3}", list["route0"], list["number"], list["date0"], list["time0"]);
                        foreach (var car in list["cars"])
                        {
                           if (null != options.Query && MatchCarriage(options.Query, car))
                           {
                              logger.Warn("{0}: {1}", car["type"], car["freeSeats"]);
                              var i = 10;
                              while (i-- >= 0)
                                 Console.Beep();
                           }
                           else
                           {
                              logger.Trace("{0}: {1}", car["type"], car["freeSeats"]);
                           }

                        }

                        Console.WriteLine();
                     }

                     Console.WriteLine();
                  }

                  Thread.Sleep(timeout);
               }
               catch (InvalidOperationException ex)
               {
                  logger.Error(ex);
                  Thread.Sleep(timeout);
               }               
            }
            while (!isCanceled);
         }
         catch (Exception ex)
         {
            logger.Fatal(ex);
         }
      }

      static bool MatchCarriage(string query, dynamic car)
      {
         using (var context = new JavascriptContext())
         {
            context.SetParameter("car", car);
            context.SetParameter("result", false);
            var script = @"result = {0}(car);".FormatWith(query);
            context.Run(script);
            var result = context.GetParameter("result");
            return !(null == result || object.Equals(false, result));
         }
      }

      static Query GetQuery(Options options)
      {
         var query =
            new Query()
            {
               Date1 = options.Date1,
               Date2 = options.Date2 ?? options.Date1,
               Seats = options.Seats,
               Station1 = options.Station1,
               Station2 = options.Station2,
            };

         query.Code1 = GetCode(query.Station1);
         query.Code2 = GetCode(query.Station2);
         return query;
      }

      static dynamic GetTimetable(Query query, Session session)
      {
         do
         {
            var timetable =
               Request(
                  new Uri(
                     "http://pass.rzd.ru/timetable/public/ru?STRUCTURE_ID=735&layer_id=5371&dir=0&tfl=3&checkSeats={0}&st0={1}&code0={2}&dt0={3}&st1={4}&code1={5}&dt1={6}&rid={7}&SESSION_ID={8}"
                        .FormatWith(query.Seats, query.Station1, query.Code1, query.Date1, query.Station2, query.Code2, query.Date2, session.Hash, session.Id)),
                  session.Cookies);

            if (string.Equals(timetable.Data["result"], "error", StringComparison.InvariantCultureIgnoreCase))
               throw new InvalidOperationException(
                  "Invalid request: {0}".FormatWith((string)timetable.Data["message"]));

            if (!string.Equals(timetable.Data["result"], "ok", StringComparison.InvariantCultureIgnoreCase))
            {
               Thread.Sleep(100);
               continue;
            }

            return timetable.Data["tp"];
         }
         while (true);
      }

      static Session GetSession(Query query)
      {
         var session =
            Request(
               new Uri(
                  "http://pass.rzd.ru/timetable/public/ru?STRUCTURE_ID=735&layer_id=5371&dir=0&tfl=3&checkSeats={0}&st0={1}&code0={2}&dt0={3}&st1={4}&code1={5}&dt1={6}"
                     .FormatWith(query.Seats, query.Station1, query.Code1, query.Date1, query.Station2, query.Code2, query.Date2)));

         if (!string.Equals(session.Data["result"], "rid", StringComparison.InvariantCultureIgnoreCase))
            throw new InvalidOperationException(
               "Invalid request: {0}".FormatWith((string)session.Data["message"]));


         var cookies = new CookieCollection();
         cookies.Add(session.Cookies["JSESSIONID"]);

         return
            new Session
            {
               Id = session.Data["SESSION_ID"],
               Hash = session.Data["rid"],
               Cookies = cookies,
            };
      }

      static int GetCode(string station)
      {
         var code =
              ((IEnumerable<dynamic>)Request(new Uri("http://rzd.ru/suggester?stationNamePart={0}&lang=ru&lat=0&compactMode=y".FormatWith(station))).Data)
                 .Where(x => string.Equals(x["n"], station, StringComparison.InvariantCultureIgnoreCase))
                 .Select(x => x["c"])
                 .FirstOrDefault();

         if (null == code)
            throw new InvalidOperationException(
               "Invalid request: Can't find code for station '{0}'".FormatWith(station));

         return code;
      }

      static Responce Request(Uri uri, CookieCollection cookies = null)
      {
         var request = (HttpWebRequest)WebRequest.Create(uri);
         request.ContentType = "text/javascript";

         request.CookieContainer = new CookieContainer();
         if (null != cookies)
            request.CookieContainer.Add(cookies);

         using (var responce = request.GetResponse())
         using (var stream = responce.GetResponseStream())
         using (var reader = new StreamReader(stream))
         {
            var serializer = new JavaScriptSerializer();
            return
               new Responce
               {
                  Data = serializer.Deserialize<dynamic>(reader.ReadToEnd()),
                  Cookies = request.CookieContainer.GetCookies(new Uri("http://pass.rzd.ru")),
               };
         }
      }

      static Options ParseOptions(IEnumerable<string> args)
      {
         var processor =
            Processor.Create<Options>(
               new Converter(new ConvertStrategy()));

         try
         {
            return processor.Map(args);
         }
         catch (InvalidOperationException ex)
         {
            logger.Error(ex.Message);
            return new Options { ShowHelp = true, };
         }
      }

      class Session
      {
         public int Id { get; set; }
         public int Hash { get; set; }
         public CookieCollection Cookies { get; set; }
      }

      class Query
      {
         public string Station1 { get; set; }
         public int Code1 { get; set; }
         public string Station2 { get; set; }
         public int Code2 { get; set; }
         public string Date1 { get; set; }
         public string Date2 { get; set; }
         public int Seats { get; set; }
      }

      class Responce
      {
         public dynamic Data { get; set; }
         public CookieCollection Cookies { get; set; }
      }
   }
}