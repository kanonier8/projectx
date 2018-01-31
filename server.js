const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const db             = require('./config/db');
const path    	     = require("path");

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(db.url, (err, database) => {
	const db = database.db('test');
	if (err) return console.log(err)
	require('./app/routes')(app, db);

	app.listen(port, function(){
	  console.log('We are live on ' + port);
	});             
})

