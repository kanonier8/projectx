const request    = require('request');

module.exports = {
	login: function(res,token,db){
        var me = this;
        request({
            url: 'https://www.googleapis.com/userinfo/v2/me',
            method: 'get',
            headers: {
                'Host': 'www.googleapis.com',
                'Authorization': 'Bearer ' + token
            }
        }, function(err, resp, body) {
            const user = JSON.parse(body);
            const id = {'id':user.id}
            if(!user.error){
                me.checkUser(db,user,id,res);
            }else{
                res.send('Auth error');
            }
        });
    },
    checkUser: function(db,user,id,res){
        var me = this;
        console.log(id);
        db.collection('users').findOne(id, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                if(item){
                    me.updateUser(db,user,id,res)
                }else{
                    me.addUser(db,user,res)
                }
            }
        });
    },
    addUser: function(db,user,res){
        db.collection('users').insert(user, (err, result) => {
            if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                res.send('user added');
            }
        });
    },
    updateUser: function(db,user,id,res){
        db.collection('users').update(id, user, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                res.send(user);
            } 
        });
    }

}