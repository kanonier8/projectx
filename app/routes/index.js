const noteRoutes = require('./note_routes');
const auth 		 = require('../models/auth');
const path       = require("path");
const multer  	 = require('multer')
const md5 		 = require('md5');
const request    = require('request');

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

	app.get('/webpack', (req,res) => {
		res.sendFile(path.join(__dirname, '../..', 'public/webpack/home.html'));
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

	app.post('/account/auth', (req,res) => {
		var token = req.body.access_token;
		auth.login(res,token,db);
	})

	app.post('/account/vauth', (req,res) => {
		var code = req.body.code;
		console.log(code);
		request({
            url: 'https://oauth.vk.com/access_token?client_id=6347497&client_secret=YWcDQjRVPyvzo45HzsMK&redirect_uri=http://gilani.ru/test&code='+code,
            method: 'get',
			// data: {
			// 	client_id: 6347497,
			// 	client_secret: 'YWcDQjRVPyvzo45HzsMK',
			// 	redirect_uri: 'http://gilani.ru/test',
			// 	code: code
			// }
        }, function(err, resp, body) {
            const user = JSON.parse(body);
			request({
				url: 'https://api.vk.com/method/users.get?uids='+user.user_id+'&fields=uid,first_name,last_name,nickname,screen_name,sex,bdate,city,country,timezone,photo&access_token='+user.access_token
			}, function(err, resp, body){
				const user = JSON.parse(body);

				if(!user.error){
					const id = {'uid':user.response[0].uid}
					auth.checkUser(db,user.response[0],id,res);
				}else{
					res.send('Auth error');
				}
			})
        });
	})
};
