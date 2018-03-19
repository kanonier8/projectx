'use strict';

var request = require('request'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    hI18n = require('i18n'),
    jake = require('jake'),
    handlebars = require('handlebars'),
    sync = require('synchronize'),
    http = require('http'),
    fs = require('fs'),
    _ = require('lodash'),
    moment = require('moment');

var pages = [{
        name: 'index',
        dir: '',
        script: 'index_stat.js',
        title: 'main_title',
        desc: 'main_desc',
        page: {
            head: {file: 'h.hbs'},
            body: [ 'main.hbs']
        }
    }
];
    
var static_path = '/data/www/static.mmska.ru/ytstat/';

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      callback(err, body);
    }
  );
}

const urls = {
    index: [
        "https://kedoo.com/youtube/api/stat/get_diff_report?period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_category_reports?format=row&period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_top_channels?limit=5&metric=monthly_views&period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_top_networks?limit=5&metric=monthly_views&period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_country_reports?period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_category_reports?period=now&segment=1000",
        "https://kedoo.com/youtube/api/stat/get_main_graph?period=now&segment=1000"
    ]
    // 
 //    ,
    // channels: [
    //  "http://develop.stat.yt-dev.1124.ru/api/stat/get_top_channels?limit=100&metric=monthly_views&period=now"
    // ],
    // networks: [
    //  "http://develop.stat.yt-dev.1124.ru/api/stat/get_top_networks?limit=100&metric=monthly_views&period=now"
    // ]
};


var locArr = ['en','ru','pt','es'];
var pageData = {
    
};

handlebars.registerPartial({
    'head': fs.readFileSync('./sources/templates/head.hbs', 'utf8'),
    'header': fs.readFileSync('./sources/templates/header.hbs', 'utf8'),
    'footer': fs.readFileSync('./sources/templates/footer.hbs', 'utf8')
});

handlebars.registerHelper('st',
    function(str){
        return '{{'+str+'}}'
    }
);

hI18n.configure({
    locales: locArr,
    directory: './sources/locales'
});

handlebars.registerHelper('tr',
    function(str){
        return (str != undefined ? hI18n.__(str) : str);
    }
);

handlebars.registerHelper('getLang',
    function(str){
        return hI18n.getLocale();
    }
);

handlebars.registerHelper("log", function(something) {
    console.log(something);
});

handlebars.registerHelper("moneyFormatHelper", function(val,more) {
    if(more.data.root.watchtime == val){
        val = (val/60).toFixed();
    }
    _.forEach(more.data.root,function(item,idx){
        if(idx == 'info_now' || idx == 'info_last'){
            if(item.watchtime == val){
                val = (val/60).toFixed();
            }
        }
    });
    return String(val).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,')
});

handlebars.registerHelper("moneyFormatHelperWt", function(val,more) {
    val = (val/60).toFixed();
    return String(val).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,')
});

handlebars.registerHelper("convertTitle", function (title){
    if(!title) return '';
    return title.replace(/ /g,"-").toLowerCase();
});

handlebars.registerHelper("setShortFormat", function(val,more) {
    if(more.data.root.watchtime == val){
        val = val/60;
    }
    _.forEach(more.data.root,function(item,idx){
        if(idx == 'info_now' || idx == 'info_last'){
            if(item.watchtime == val){
                val = val/60;
            }
        }
    });
    var diff = val;
    var text = "";
    var result = Math.floor(Math.abs(diff));
    var html = "";
    var minus = '';
    var arrayPower = [1, 1000, 1000000, 1000000000, 1000000000000];
    var moneyMap = {0: "", 1: "K", 2: "M", 3: "B", 4: "T"};
    var index = _.findIndex(arrayPower, function(item) {
        if(result > 999){
            return item > result
        }
        return false;
    });
    if(diff){
        if(result > arrayPower[4]){
            result = parseFloat(String(result / arrayPower[4])).toFixed(1) + "" + moneyMap[4];
        }
        if(index <= 0) {
            result = String(result);
        }else {
            result = parseFloat(String(result / arrayPower[index - 1])).toFixed(1) + "" + moneyMap[index - 1];
        }
    }else{
        result = "";
    }
    if(diff < 0){
        minus = '-';
    }
    if(diff == 0){
        result = '0';
    }
    return minus+result;
});

handlebars.registerHelper("setShortFormatWt", function(val,more) {
    val = val/60;
    
    var diff = val;
    var text = "";
    var result = Math.floor(Math.abs(diff));
    var html = "";
    var minus = '';
    var arrayPower = [1, 1000, 1000000, 1000000000, 1000000000000];
    var moneyMap = {0: "", 1: "K", 2: "M", 3: "B", 4: "T"};
    var index = _.findIndex(arrayPower, function(item) {
        if(result > 999){
            return item > result
        }
        return false;
    });
    if(diff){
        if(result > arrayPower[4]){
            result = parseFloat(String(result / arrayPower[4])).toFixed(1) + "" + moneyMap[4];
        }
        if(index <= 0) {
            result = String(result);
        }else {
            result = parseFloat(String(result / arrayPower[index - 1])).toFixed(1) + "" + moneyMap[index - 1];
        }
    }else{
        result = "";
    }
    if(diff < 0){
        minus = '-';
    }
    if(diff == 0){
        result = '0';
    }
    return minus+result;
});

handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper("counter", function (index){
    return index + 1;
});

handlebars.registerHelper("createdDate", function (val){
    var result = '';
    result = moment().add(-val,'day').format('DD-MM-YYYY');
    return result;
});

handlebars.registerHelper("checkMinus", function (str){
    if(!str || str == 0) return false;
    str = str.toString();
    var result = '';
    if(str.indexOf('-')>-1){
        result = 'minus';
    }else{
        result = 'plus';
    }
    return result;
});

handlebars.registerHelper("removeMinus", function (str){
    if(!str && str != 0) return '';
    if(str == 0){
        return '';
    }
    str = str.toString();
    var result = '';
    if(str.indexOf('-')==-1){
        str = '+'+str;
    }
    return str;
});

handlebars.registerHelper("addPlus", function (str){
    if(!str) return '';
    str = str.toString();
    var result = '';
    if(str.indexOf('-') == -1 && str != 0){
        result = '+';
    }
    return result;
});

handlebars.registerHelper("truncate", function (str, maxlength){
    if (str.length > maxlength) {
        return str.slice(0, maxlength - 3) + '...';
    }
    return str;
});

handlebars.registerHelper("convertDate", function (time){
    return hI18n.__(moment(time).format('MMM').toLowerCase())+' '+moment(time).format('YYYY');
});

handlebars.registerHelper("rand", function (time){
    return Math.random();
});

handlebars.registerHelper("setFlag", function(code) {
    if(!code) return 'empty';
    return code.toLowerCase();
});

handlebars.registerHelper('trCat',
    function(str){
        return (str != undefined ? hI18n.__('cat_'+str) : str);
    }
);

handlebars.registerHelper("dayToExpire", function(date) {
    date = moment(date).format('YYYY,MM,DD,HH,mm').split(',');
    var todayDate = moment().format('YYYY,MM,DD,HH,mm').split(',');
    var date = new Date(date[0],date[1]-1,date[2],date[3],date[4]),
        today = new Date(todayDate[0], todayDate[1]-1, todayDate[2], todayDate[3], todayDate[4]), delta;

    delta = today - date;

    var days = Math.round(delta / 1000 / 60 / 60/ 24);

    if(days == 0){
        return hI18n.__('today');
    }else if(days == 1){
        return days+' '+hI18n.__('1_d_ago');
    }else if(days > 4){
        return days+' '+hI18n.__('3_d_ago');
    }else{
        return days+' '+hI18n.__('2_d_ago');
    }

});

mkdirp('html', function(err) {
    console.log(err);
});

http.globalAgent.maxSockets = 10;

for (var i in urls){
   let reqPromise = new Promise((resolve, reject) =>{           
        let a = sendRequest(urls[i],i);
        resolve(a);
    });
}

// sendRequest(urls.channels);

function sendRequest(urls,name){
    pageData = {};
    async.map(urls, httpGet, function (err, res){
        if (err){ 
            console.log("errrr===>"+err);
            process.exit(1);
        }
        console.log(res.length)
        for(var i=0; i<res.length; i++){
            if (res[i].body){        
               pageData[name+'_data_'+i] = res[i].body;
            }else{
                console.log("not all request are good");
                process.exit(1);       
            }
            

        }
        createTemplate(pageData);
    });
}

var dd = [];

function createTemplate(data){
    var sData = data;

    locArr.forEach((lang)=>{
       
        hI18n.setLocale(lang);

        pages.forEach((page)=>{
            
            var dir = page.dir,
                name = page.name,
                file = 'index.html',
                stPath = '/data/www/static.mmska.ru/ytstat/';

            mkdirp(stPath+lang+"/"+dir, function(err) {
                var promiseArr = [];
                let headPromise = new Promise((resolve, reject) =>{
                    fs.readFile('./sources/templates/h.hbs', 'utf-8', function(error, source){
                        hI18n.setLocale(lang);
                        let template = source;
                        resolve(template);
                    });
                });
                promiseArr.push(headPromise);

                page.page.body.forEach((item)=>{
                    let bodyPromise = new Promise((resolve, reject) =>{
                        fs.readFile('./sources/templates/'+item, 'utf-8', function(error, source){
                            hI18n.setLocale(lang);

                            let data = sData;
                            data['network'] = false;
                            data['script'] = page.script;
                            data['lang'] = lang+'/';
                            data['lng'] = lang;
                            data['bc'] = page.bc;
                            data['link'] = page.link;
                            data['title'] = page.title;
                            data['desc'] = page.desc;
                            dd = data;
                           
                            // if(lang == 'en'){
                            //  data.lang = '';
                            // }
                            if(name == 'network'){
                                data['network'] = true;
                            }
                            let template = handlebars.compile(source);
                            let part_body = template(data);
                            resolve(part_body);
                        });
                    });
                    promiseArr.push(bodyPromise);
                });

                Promise.all(promiseArr).then((results)=>{
                    let stream = fs.createWriteStream(stPath+lang+"/"+dir+'/'+file);
                    stream.once('open', function(fd) {

                        let html = "";
                        html += results[0];
                        html += results.slice(1, results.length).join("\n") + "\n";
                        if(name == 'index'){
                            html += '<script type="text/javascript">var graphData = {countries:'+JSON.stringify(dd.index_data_4)+',categories:'+JSON.stringify(dd.index_data_5)+',diffGraph:'+JSON.stringify(dd.index_data_6)+'};</script>';    
                        }
                        stream.end(html);
                    });
                });
            });
        });
    });
}
