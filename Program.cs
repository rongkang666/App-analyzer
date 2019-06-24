using System;
using System.IO;

namespace test2
{
    class Program
    {   
        
        //https://stackoverflow.com/questions/9975640/check-if-char-isletter
        static bool isEnglishLetter(char c)
        {
            return ((c>='A' && c<='Z') || (c>='a' && c<='z'));
        }

        //assume the format of date is sth like that May 25, 2019
        static bool isFormatOfDate(string contentUndetermine){
            string[] nameOfEachMonth = new string[]{
                "January",
                "Feburary",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            };
            foreach(string nameOFAMonth in nameOfEachMonth){
                if(contentUndetermine.StartsWith(nameOFAMonth)){
                    int lengthOfTheMonthName = nameOFAMonth.Length;
                    int dd = 0;
                    //if only a string using sample input below is passing then all the three values below need not to be minus one
                    //if(contentUndetermine.Length == lengthOfTheMonthName + 10 || contentUndetermine.Length == lengthOfTheMonthName + 9){
                    if(contentUndetermine.Length == lengthOfTheMonthName + 10 -1 || contentUndetermine.Length == lengthOfTheMonthName + 9 -1){
                        //if(contentUndetermine.Length == lengthOfTheMonthName + 10){
                        if(contentUndetermine.Length == lengthOfTheMonthName + 10-1){
                            dd = 2;
                        }else{
                            dd = 1;
                        }
                        string subContentUndetermine = contentUndetermine.Substring(lengthOfTheMonthName);
                        if(subContentUndetermine[0] == ' ' && subContentUndetermine[dd+2] == ' ' && subContentUndetermine[dd+1] == ','){
                            return true;
                        }
                        
                    }
                }
            }
            return false;
        }
        static void Main(string[] args)
        {
            //Console.WriteLine("Hello World!");
            //create object
            int initialCapacity = 82765;
            int maxEditDistanceDictionary = 2; //maximum edit distance per dictionary precalculation
            var symSpell = new SymSpell(initialCapacity, maxEditDistanceDictionary);
                
            //load dictionary
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            //string dictionaryPath= baseDirectory + "frequency_dictionary_en_82_765.txt";
 Console.WriteLine(baseDirectory);

        string dictionaryPath= baseDirectory + "../../../frequency_dictionary_en_82_765.txt";

            int termIndex = 0; //column of the term in the dictionary text file
            int countIndex = 1; //column of the term frequency in the dictionary text file
            if (!symSpell.LoadDictionary(dictionaryPath, termIndex, countIndex))
            {
            Console.WriteLine("File not found!");
            //press any key to exit program
            Console.ReadKey();
            return;
            }

            int i = 0;
            string contentUndetermine = "";
            string contentDate = "";
            string contentScore = "";
            string contentLineOfReviews = "";

            /*
                http://www.vcskicks.com/read_text_file.php
                here is a method provided by vcskicks.com which allow user to read the whole document at once 
                and pass all the content as a single string
                decide not to read the whole document as pass all the content as a string since the string may be so huge

            */


            // string path = "C:/Users/kongwh/Desktop/test2/t1.txt";

            // StreamReader textFile = new StreamReader(path);

            // string input = textFile.ReadToEnd();

            // textFile.Close();

            /*
                https://www.tutorialspoint.com/csharp/csharp_text_files.htm
                here is a method provided by tutorial point which read a document line by line 
                and pass each line as a string

                and write string to a document
            */

            string line = "";
            //https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/main-and-command-args/command-line-arguments
            string nameOfadjustedDocument = args[0];
            //https://www.geeksforgeeks.org/c-sharp-insert-method/
            nameOfadjustedDocument = nameOfadjustedDocument.Insert(nameOfadjustedDocument.Length - 4, "_adj");

            using(StreamWriter sw = new StreamWriter(nameOfadjustedDocument)){
            //using(StreamWriter sw = new StreamWriter(adj.txt)){
                using (StreamReader sr = new StreamReader(args[0])) {
                //using (StreamReader sr = new StreamReader("t1.txt")) {
                    while ((line = sr.ReadLine()) != null) {
                        
                        //Console.WriteLine("line: " + line);
                        //Console.WriteLine("line length: " + line.Length);
                        
                        contentUndetermine = line;

                        if(isFormatOfDate(contentUndetermine)){
                            //contentUndetermine is a date
                            contentDate = contentUndetermine;
                            i = 1;
                            Console.WriteLine(contentDate);
                            sw.WriteLine(contentDate);
                        }else if(i == 1){
                            //contentUndetermine is a score
                            contentScore = contentUndetermine;
                            Console.WriteLine(contentScore);
                            sw.WriteLine(contentScore);
                            i = 2;
                        }else{
                            string onlyEnglishAndSpace = "";
                            string notEnglishAndSpace = "";
                            string adjustedReviewLine = "";

                            contentLineOfReviews = contentUndetermine;

                            foreach(char charInLine in contentLineOfReviews){
                                if(charInLine.ToString().Contains(" ") || isEnglishLetter(charInLine)){
                                    onlyEnglishAndSpace = onlyEnglishAndSpace + charInLine.ToString();
                                }else{
                                    notEnglishAndSpace = charInLine.ToString();

                                    if(onlyEnglishAndSpace.Equals("")){
                                        adjustedReviewLine = adjustedReviewLine + notEnglishAndSpace; 
                                    }else{
                                        //word segmentation and correction for multi-word input strings with/without spaces
                                        var suggestion = symSpell.WordSegmentation(onlyEnglishAndSpace);
                                        adjustedReviewLine = adjustedReviewLine + suggestion.correctedString + notEnglishAndSpace;                                   
                                    }

                                    onlyEnglishAndSpace = "";
                                    notEnglishAndSpace = "";
                                    
                                }
                            }


                            if(!onlyEnglishAndSpace.Equals("")){
                                //word segmentation and correction for multi-word input strings with/without spaces
                                var suggestion = symSpell.WordSegmentation(onlyEnglishAndSpace);
                                adjustedReviewLine = adjustedReviewLine + suggestion.correctedString;                                   
                            }

                            Console.WriteLine(adjustedReviewLine);
                            sw.WriteLine(adjustedReviewLine);
                            i++;   
                        }

                        
                    }
                }
            }


            //----------------------------sample input----------------------------------------
            // //sample input
            // string input="January 25, 2019\n5\ngooood😋\nJune 25, 2019\n1\nsofarsogood\n";
            
            // //Console.WriteLine("input length: " + input.Length);
            // foreach(char c in input){

            //     contentUndetermine = contentUndetermine + c.ToString( );
            //     //Console.WriteLine("current: " + contentUndetermine);
            //     if(contentUndetermine.Contains("\r") || contentUndetermine.Contains("\n")){
            //         if(isFormatOfDate(contentUndetermine)){
            //             //contentUndetermine is a date
            //             contentDate = contentUndetermine;
            //             Console.WriteLine(contentDate);
            //             i = 1;
            //         }else if(i == 1){
            //             //contentUndetermine is a score
            //             contentScore = contentUndetermine;
            //             Console.WriteLine(contentScore);
            //             i = 2;
            //         }else{
            //             string onlyEnglishAndSpace = "";
            //             string notEnglishAndSpace = "";
            //             string adjustedReviewLine = "";

            //             contentLineOfReviews = contentUndetermine;
            //             foreach(char charInLine in contentLineOfReviews){
            //                 if(charInLine.ToString().Contains(" ") || isEnglishLetter(charInLine)){
            //                     onlyEnglishAndSpace = onlyEnglishAndSpace + charInLine.ToString();
            //                 }else{
            //                     notEnglishAndSpace = charInLine.ToString();

            //                     if(onlyEnglishAndSpace.Equals("")){
            //                         adjustedReviewLine = adjustedReviewLine + notEnglishAndSpace; 
            //                     }else{
            //                         //word segmentation and correction for multi-word input strings with/without spaces
            //                         var suggestion = symSpell.WordSegmentation(onlyEnglishAndSpace);
            //                         adjustedReviewLine = adjustedReviewLine + suggestion.correctedString + notEnglishAndSpace;                                   
            //                     }

            //                     onlyEnglishAndSpace = "";
            //                     notEnglishAndSpace = "";
                                
            //                 }
            //             }
            //             // //word segmentation and correction for multi-word input strings with/without spaces           
            //             // var suggestion = symSpell.WordSegmentation(contentLineOfReviews);

            //             // //display term and edit distance
            //             // Console.WriteLine(suggestion.correctedString);

            //             //Console.WriteLine(contentLineOfReviews);
            //             Console.WriteLine(adjustedReviewLine);
            //             adjustedReviewLine = "";
            //             i++;                        
            //         }
            //         //clear the content
            //         contentUndetermine = "";
            //     }
            // }
            //----------------------------sample input ends----------------------------------------

            //----------------functions used for spell check provided by symSpell------------------

            // //word segmentation and correction for multi-word input strings with/without spaces           
            // var suggestion1 = symSpell.WordSegmentation(input);

            // //display term and edit distance
            // Console.WriteLine(suggestion1.correctedString);

            // //lookup suggestions for single-word input strings
            // string inputTerm="goodandnicedesign";
            // //string inputTerm=suggestion1.correctedString;
            // int maxEditDistanceLookup = 1; //max edit distance per lookup (maxEditDistanceLookup<=maxEditDistanceDictionary)
            // var suggestionVerbosity = SymSpell.Verbosity.Closest; //Top, Closest, All
            // var suggestions = symSpell.Lookup(inputTerm, suggestionVerbosity, maxEditDistanceLookup);
            // //lookup suggestions for multi-word input strings (supports compound splitting & merging)
            // //inputTerm="whereis th elove hehad dated forImuch of thepast who couqdn'tread in sixtgrade and ins pired him";
            // maxEditDistanceLookup = 2; //max edit distance per lookup (per single word, not per whole input string)
            // suggestions = symSpell.LookupCompound(inputTerm, maxEditDistanceLookup);

            // //display suggestions, edit distance and term frequency
            // foreach (var suggestion in suggestions)
            // { 
            // Console.WriteLine(suggestion.term);
            // }



            //press any key to exit program
            //Console.ReadKey();
        }
    }
}
