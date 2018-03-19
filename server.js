const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const db             = require('./config/db');
const path    	     = require("path");
const request 		 = require('request');

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(db.url, (err, database) => {
	const db = database.db('test');
	if (err) return console.log(err)
	require('./app/routes')(app, db);

	app.listen(port, function(){
	  console.log('We are live on ' + port);
	});          

	// request('https://www.sports.ru/core/article/list/?args=%7B%22filter%22%3A%7B%22type%22%3A%22homepage%22%2C%22name%22%3A%22%22%2C%22sub-name%22%3A%22%22%2C%22exclude%22%3A%5B1059788227%5D%7D%2C%22count%22%3A10%2C%22last_published%22%3A1517245620%7D', { json: true }, (err, res, body) => {
	//   if (err) { return console.log(err); }
	//   console.log(body.documents);
	// });
})

