const ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
	// 5a6b18a06e8f374408d5f3e3

	// app.get('/notes/:id', (req, res) => {
	// 	const id = req.params.id;
	// 	const details = { '_id': new ObjectID(id) };
	// 	db.collection('notes').findOne(details, (err, item) => {
	// 		if (err) {
	// 			res.send({'error':'An error has occurred'});
	// 		} else {
	// 			res.send(item);
	// 		}
	// 	});
	// });

	app.get('/api/post/list', (req, res) => {
		db.collection('posts').find({}).toArray((err, item) => {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(item);
			}
		});
	});

	app.get('/api/post/item', (req,res) => {
		const id = req.query.id;
		const details = { _id: id };
		db.collection('posts').findOne(details, (err, item) => {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(item);
			}
		});
	})

	app.delete('/notes/:id', (req, res) => {
		const id = req.params.id;
		const details = { '_id': new ObjectID(id) };
		db.collection('notes').remove(details, (err, item) => {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send('Note ' + id + ' deleted!');
			} 
		});
	});

	app.post('/notes', (req, res) => {
		const note = { text: req.body.title, title: req.body.text };
		db.collection('notes').insert(note, (err, result) => {
			if (err) { 
				res.send({ 'error': 'An error has occurred' }); 
			} else {
				res.send(result.ops[0]);
			}
		});
	});

	app.put ('/notes/:id', (req, res) => {
		const id = req.params.id;
		const details = { '_id': new ObjectID(id) };
		const note = { text: req.body.text, title: req.body.title };
		db.collection('notes').update(details, note, (err, result) => {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				res.send(note);
			} 
		});
	});

	
};