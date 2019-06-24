

//connect clients with their servers according to the port number
var WS = new WebSocket('ws://localhost:4444');
var WS_2 = new WebSocket('ws://localhost:4445');
var WS_3 = new WebSocket('ws://localhost:4446');
var WS_4 = new WebSocket('ws://localhost:4447');



//----------------------------------data transition between clients and servers----------------------------------

//client1 receiving data from server1
WS.onmessage = (payload)=>{
  //console.log(payload.data); uncomment this to see data in the browser console 
    var result = payload.data.split(",");//make the result an array
    
    //console.log(result); uncomment this to see the new array the client1 will use
    
    //display the review number (filtered) in the html
    displayResult(result[0]);
    
    //console.log(result);
    
    var days = [];//store the difference number, e.g. -2, -3, -4
    
    var review_results = [];//stroe the review info
    
    
    //display reviews selected in html
    for(let i=(parseInt(result[0])+1);i<result.length;i++){
       
             review_results.push(result[i]);
        
               // console.log(review_results);
        
//             displayReview(review_results[i],i);

    }
    
    
    for(let i = 0; i<review_results.length; i++){
        displayReview(review_results[i],i);
    }
    
    
    
    //populate days[] 
    for(let i=0; i<parseInt(result[0]);i++){
        
        days[i] = result[i+1];
        
    }
    
    //genet=rate new aaray inlcuding the elements and the element's number
    var newGraphData = compressArray(days);
    
    console.log(newGraphData);
    
    
    //draw graph
            var trace1 = {
              x: [],
              y: [],
              type: 'scatter'
            };



          
    //assign the data
        
        for(let i=0; i<newGraphData.length; i++){
            
            trace1.y[i] = newGraphData[i].count;
            trace1.x[i] = parseInt(newGraphData[i].value)+1;
            
            
        }
    
        //check if today is included in the days
       if(trace1.x[trace1.x.length-1] !== "0"){
           trace1.x.push("0");
           trace1.y.push("0");
       }
    
    
    
            var data = [trace1];

            Plotly.newPlot('chart', data);
        

    

    
};




//client2 receiving data from server2
WS_2.onmessage = (payload)=>{
  //console.log(payload.data);  uncomment this to see data in the browser console 
    var result = payload.data.split(",");//make the result an array
    
    
    
    //display AppId in html
    for(let i=0;i<result.length;i++){
       
             displayAppId(result[i]);
                
       
    }
    
};

//implementing....

WS_3.onmessage = (payload)=>{
  //console.log(payload.data);  
  var result = payload.data.split(",");
    
  //console.log(result); uncomment to see the result sent from server3
    
     //display table names in html
    for(let i=0;i<result.length;i++){
       
             displayTable(result[i]);
                
       
    }
   
    
};



WS_4.onmessage = (payload)=>{
  
  var result = payload.data.split(",");
    
  //console.log(result); //uncomment to see the result sent from server4
    
      for(let i=0;i<result.length;i++){
       
            displayReviewFromDatabase(result[i],i);

    }
   
    
};



//------------------------------interface manipulation--------------------------------------------------------


//submit the first form to inform server1 to get reviews
document.forms[0].onsubmit = ()=>{
    
let input = document.getElementById('product');
let input2 = document.getElementById('filter');
let input3 = document.getElementById('pageSelect');
    

let re = [input.value,input2.value,input3.value];
    
 WS.send(re);//client1 send information to server1, then server1 knows what information user wants to get 
    
    
    
};



//submit the second form to inform server2 to get reviews
//document.forms[1].onsubmit = ()=>{
//    
//    let input = document.getElementById('category');
//    let re = input.value;
//
//    WS_2.send(re);//client2 send information to server2, then server2 knows what search user wants to get
//}



//inform server3 that client3 has launch an event
document.getElementById("table_info").addEventListener('click', function(){
    
    WS_3.send("showInfo");
    
});




//----------------------------Help functions--------------------------------------------



//when click submit, show user Searching to indicate it is searching for reviews
function showSearching(){
    document.querySelector('h1').innerHTML= `Searching  <div class="spinner-grow text-dark spinner-1" role="status"></div><div class="spinner-grow text-dark spinner-2" role="status"></div><div class="spinner-grow text-dark spinner-3" role="status"></div>`;
}

//diaplay result of number of reviews in html
function displayResult(result){
    document.querySelector('h1').innerHTML='The result is '+ result;
}

//display review informaiton in html
function displayReview(result,i){
   var pNode = document.getElementById("one");
    
    //each Date comes with green color to make it clear 
    if(i%3==2){
        pNode.insertAdjacentHTML('afterend',`<p class="bg-success">${result}</p>`);
    }else{
        pNode.insertAdjacentHTML('afterend',`<p>${result}</p>`);     
    }
  // pNode.insertAdjacentHTML('afterend',`<p>${result}</p>`); //uncomment this to erase the color
   
    
}


//display appId in html
function displayAppId(result){
   var pNode = document.getElementById("appId");
   
   //append appIds in the html
   pNode.insertAdjacentHTML('afterend',`<p id=${result} style="cursor:pointer">${result}</p>`);
    
    //click the appId and show it in the product input field
    document.getElementById(result).addEventListener('click', function(){
      document.getElementById("product").value = result;
    });
    
}

function displayTable(result){
    
    var pNode = document.getElementById("tableList");
    
    var resultId = result.replace(/ /g, '');
    
    pNode.insertAdjacentHTML('afterend',`<p id=${resultId} style="cursor:pointer">${result}</p>`);
    
    
    //click the table name shown on the web page and client4 send the name to server4 for data retrival 
    document.getElementById(resultId).addEventListener('click', function(){
        
    document.getElementById("tableName").innerHTML = result;
        
     WS_4.send(result);//client sent table name to server4
    });
    
}


//display review informaiton in html from database-----static
function displayReviewFromDatabase(result,i){
   var pNode = document.getElementById("dbInfo");
    
    //each Date comes with green color to make it clear 
    if(i%3==2){
        pNode.insertAdjacentHTML('afterend',`<p class="bg-success">${result}</p>`);
    }else{
        pNode.insertAdjacentHTML('afterend',`<p>${result}</p>`);     
    }
  // pNode.insertAdjacentHTML('afterend',`<p>${result}</p>`); //uncomment this to erase the color
   
    
}


//calculate duplicate elements in a array

function compressArray(original) {
    
    var compressed = [];
    // make a copy of the input array
    var copy = original.slice(0);
    
    // first loop goes over every element
    for (var i = 0; i < original.length; i++) {
        
        var myCount = 0;
        // loop over every element in the copy and see if it's the same
        for (var w = 0; w < copy.length; w++) {
            if (original[i] == copy[w]) {
                // increase amount of times duplicate is found
                myCount++;
                // sets item to undefined
                delete copy[w];
            }
        }
        
        if (myCount > 0) {
            var a = new Object();
            a.value = original[i];
            a.count = myCount;
            compressed.push(a);
        }
    }
    
    return compressed;
};


    
    
    












