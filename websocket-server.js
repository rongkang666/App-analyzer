
//variable definition

var WebSocketServer = require('ws').Server;
var WSS =  new WebSocketServer({port:4444});//define the first server, used to retrive review info
var WSS_2 =  new WebSocketServer({port:4445});//define the second server, used to deal with search category
var WSS_3 =  new WebSocketServer({port:4446});//define the third server, used to deal with static database manipulation, implemented later
var WSS_4 =  new WebSocketServer({port:4447});//define the forth server, used to send the table info to user so that client4 can display those info


var gplay = require('google-play-scraper');//api used in the first server
var gplay_2 = require('google-play-scraper');//api used in the second server
var fs = require("fs");
var exec = require('child_process').exec;



//-------------------------Review retrival in the first server-------------------------------

//databse connection
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017', function (err, client) {
  if (err) throw err;
    
  console.log("server1 connected with databse");//indicated mongodDB databse is connected 
    
    
  const db = client.db('appdata');//create/find database
    

    
    
    //--------------------------send data to client1-----------------------------------
    
WSS.on('connection', (ws)=>{//build connection between server1 and client1
  
 ws.on('message', (message)=>{//listen to the message from client,e.g. submit form
       
        var newMessage = message.split(',');//make message array
        
        console.log(newMessage[0]);//confirm the request is sent, newMessage[0] is the product id
        
        var number = 0;//final result number
        
        
        //use google-play-scraper to get review
        async function getResult(){
        var outcome = [];
            
        //search for newMessage[2] pages of reviews
        for(let i=0;i<newMessage[2];i++){

        let result = await gplay.reviews({
                                      appId: newMessage[0], //e.g.com.facebook.katana
                                      page: i,
                                      sort: gplay.sort.NEWEST //more options
                                    });  
            
            //info
//            console.log(i);
//            console.log(result);
            
           // if()
            
            
        outcome.push(result);
          
        }
    
        //the result is a promise from async function
        return Promise.all(outcome);

        }
     
     
//call the async function to get the delayed result from google-play-scraper

getResult().then(

    result => {

        var selectedReviews = [];
        
        
        //set date to the end of database collection
        var d = new Date();
        var dateInfo = d.toLocaleString();//the data that launch the search
        
        
        
        //the result from aynsc function is a 2d array
        /*
         to see the format of result 
         uncomment console.log(result); 
        */
        
        //define the dates array, used to store date days
        var dates = [];
        
        
        
        
        for(let i = 0;i<result.length;i++){
            for(let j = 0; j<result[i].length; j++){
                if(result[i][j].text.includes(newMessage[1])){//newMessage[1] is the key word or filter
                        number++;//increment number when filter condition meets

                    //write into results into file
                      fs.appendFile("output.txt",result[i][j].date +'\n' + result[i][j].score + '\n' + result[i][j].text + '\n', function(err,data){
                            if (err) console.log(err);
                           //console.log("Successfully Written to File.");
                       });
                    
                        
                     
                        var newDate = result[i][j].date.replace(',',' ');//replace comma in date with space
                        var newText = result[i][j].text.replace(/,/g, '&#44;');//replace comma in reviews with &#44;
                        
                    
                    //push all review info into a new array
                    selectedReviews.push(
                    
                      "<strong>Review</strong>: " + newText,
                       "<strong>Score</strong>: " + result[i][j].score,
                       "<strong>Date</strong>: " + newDate
         
                    );
                    
    
                        // insert data into database
                        db.collection(`reviews(${dateInfo})-${newMessage[0]}-(key word: ${newMessage[1]};page number: ${newMessage[2]})`).insertOne({

                            content: result[i][j].text,
                            score: result[i][j].score,
                            date: result[i][j].date

                        }, (err, result)=>{
                            if(err) {
                                return console.log(err);
                            }

                            //console.log('Inserted successfully');

                        });
                    
                    
                    
                    
                    //test date rank
                    
                    //console.log(result[i][j].date);
                    
                    //get the date day, e.g. May 7, 2019, get '7'
                    //var d = new Date(result[i][j].date);
                    
                    //get the date
                    var d_review = new Date(result[i][j].date);
                    
                    //console.log(d_review);
                    
                
                    
                    //calculate the difference between today and each date
                    
                    var date_diff = d_review - d;
                    
                   //console.log(date_diff);
                    
                    var difference = Math.floor(date_diff / (24*60*60*1000));
                    
                    //store the days into dates array
                    dates.push(difference);
                    
                    
                    
   
                }//---end of if  

            }//---end of inside for loop
            
        }//---end of outside for loop

        //generate the file through spellchecker
        exec('dotnet run output.txt', function callback(error, stdout, stderr){
            // result
                console.log('successfully generated the file after spell checker.');
        });
        
        
        //test dates array, for testing purpose
        console.log(dates);
        
        
        for(let i=0; i<dates.length; i++){
            selectedReviews.unshift(dates[i]);
        }
        
    
        //console.log(selectedReviews); uncomment this to see the new review array
        

        selectedReviews.unshift(number);//put number in the first place of the array
        
        testS= selectedReviews.toString();//convert array to a string
        
        //console.log(testS); uncomment this to see the string
        
        
        //send final string to client1 from server1
        WSS.clients.forEach((client)=>{
           client.send(testS); 
        });
    }
    
);
        
        
        
        
    });
    
    
    
});

    
    

}); //-----------------end of server1--------------------------------------------  






//----------------------------send data to client2---------------------------------  

WSS_2.on('connection', (ws)=>{//build connection between server2 and client2
    
    ws.on('message',(message)=>{//listen to the message from client,e.g. submit form
        
        console.log("fetsching for category...");//indicate it is successfully connected with client2
        
        
        //call google-player-scraper to use the search function of it
        async function getResult(){
      
             let result = await gplay_2.search({
                                     term: message,//message is what user input in the search bar
                                     num: 5//number of search result being displayed
                                    });  
           
            
            return result;
     
        }
        
        
        //call ayscn function to get the delayed result
        getResult().then(
            result =>{
                
                var appIdList = [];//new array to store the search results
                
                console.log(result); //uncomment to see the result from google-play-scraper
                
                //retrive the appIds of the results and store them into appIdList
                for(let i=0;i<5;i++){
                    appIdList.push(result[i].appId);
                }
                
                //console.log(appIdList); uncomment this to see appIdList
                
                
                str = appIdList.toString();//convert appIdList to a string in order to send it to client2

                //send data to client2
                WSS_2.clients.forEach((client)=>{
                   client.send(str); 
                });

                
            }
        
        );
        
        
        
        
    });
    
});


//-------------------------server3 dealing with MangodDB-----------------------------






//databse connection
const MongoClient2 = require('mongodb').MongoClient;

MongoClient2.connect('mongodb://localhost:27017', function (err, client) {
  if (err) throw err;
    
  console.log("server3 connected with database");//indicated server3 is connected with database
    
    
    const db = client.db('appdata');//create/find database

    // loop through collections names------------------------------------------------------------
    
    db.listCollections().toArray(function(err, collInfos) {
    // collInfos is an array of collection info objects that look like:
    // { name: 'test', options: {} }
            
        var tableName = [];
            
        for(let i=0;i<collInfos.length;i++){
            tableName.push(collInfos[i].name)
        }
        
        //console.log(tableName); //uncomment this to see the database table names in the console
            
        var newTableName = tableName.toString();
        
        
            WSS_3.on('connection', (ws)=>{
                
                ws.on('message',(message)=>{
                    
                if(message=="showInfo"){//the message received from client4 should be "showInfo"
                    
                    WSS_3.clients.forEach((client)=>{

                    client.send(newTableName); //server4 send table name to client4

                });
                }
    
                });
     
            });
          
                
        });
    

   });
    
    
    
    
//-------------------------server4 dealing with data sent from client-----------------------------


//databse connection
const MongoClient4 = require('mongodb').MongoClient;

MongoClient4.connect('mongodb://localhost:27017', function (err, client) {
  if (err) throw err;
    
  console.log("server4 connected with database");//indicated server4 is connected with database
    
    
    const db = client.db('appdata');//create/find database

   
   
        
            WSS_4.on('connection', (ws)=>{
                
                ws.on('message',(message)=>{
               
                  //console.log(message);
                    
                    
                    //fetch data according to table names and send data to client4
                    db.collection(message).find().toArray(function (err, result) {
                        if (err) throw err

                        //console.log(result);//display the table information

                        var selectedtable = []; 

                        for(let i=0;i<result.length;i++){

                            var newContent = result[i].content.replace(/,/g, '&#44;');//replace the comma with &#44;
                            var newTime = result[i].date.replace(',',' ');//replace comma in date with space

                            selectedtable.push(

                          "<strong>Review</strong>: " + newContent,
                           "<strong>Score</strong>: " + result[i].score,
                          "<strong>Date</strong>: " + newTime,



                        );

                        }

                        var str = selectedtable.toString();

                       
                        WSS_4.clients.forEach((client)=>{
                          client.send(str); 
                        });
 
                    });//end of sending data from server4 to client
 
                });

            });
 
   });











