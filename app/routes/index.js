const noteRoutes = require('./note_routes');
const path       = require("path");
const multer  	 = require('multer')
const md5 		 = require('md5');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/data/www/upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

const upload = multer({ storage: storage })

module.exports = function(app, db) {
  	noteRoutes(app, db);

	app.get('/', (req,res) => {
		res.sendFile(path.join(__dirname, '../..', 'public/index.html'));
	});  

	app.get('/post/:id', (req,res) => {
		res.sendFile(path.join(__dirname, '../..', 'public/post/index.html'));
	});  

	app.get('/test', (req,res) => {
		res.sendFile(path.join(__dirname, '../..', 'public/test.html'));
	});  

	app.post('/up/post', upload.single('img'), function (req, res, next) {
		var id = md5(Date.parse(new Date()));
		const post = {
			_id: id.substr(0,8), 
			title: req.body.title, 
			img: req.file ? '/upload/'+req.file.filename : false,
			url: req.body.title.toLowerCase(),
			published: Date.parse(new Date()),
			description: req.body.description
		};
		db.collection('posts').insert(post, (err, result) => {
			if (err) { 
				res.send({ 'error': 'An error has occurred' }); 
			} else {
				res.json({status: 'Ok'});
			}
		});
	})
};
