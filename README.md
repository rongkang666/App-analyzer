Usage of app analyzer

First install all the npm package.

Open index.html in Chrome, then run nodemon websocket-server.js in the terminal

The interface of the app analyzer:type product id (can be found in google play store), type filter (key word that will be shown in the final reviews), select page number (total review numbers indicator), click submit.
After a moment, you will find the reviews shown in the interface, which include key word, along with the dates and scores; Also, in the database, you will find a new database called appdata, inside appdata, there are the results (collections) for each search.

For now, after each search, please refresh the page to do the next search. 

The app can deal with the information from databse via the user interface of the app analyzer.

The app can show the database information on user interface, with the table name, the time when the search was launched, the page number and the key word. The date informaiton for each review is added to the database.

The app can show the graph of the relationship between day gaps (0 means today, -1 means yesterday, -2 means 2 days agp, and son on) and the number of key word.

The app can generate the file after the spell checker, i.e. generating the 'grammarly correct' searched results (output.txt), including dates, score and the text of the reviews.
