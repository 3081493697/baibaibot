var https=require('https');
var http = require('http');
function isword(content){
  var ret = true;
  if(content.indexOf(" ")<0){
    for(var i=0;i<content.length;i++){
      var cha=content.charCodeAt(i);
      if((cha>=65&&cha<=90)||(cha>=97&&cha<=122)){

      }else{
        ret = false;
        break;
      }
    }
  }else{
    ret = false;
  }
  return ret;
}

function translateMsg(content,tolan,callback){
  if(tolan=='zh-CHS'){
    if(isword(content)){
      var options = {
        hostname: 'api.shanbay.com',
        port: 80,
        path: '/bdc/search/?word='+content,
        method: 'GET',
      };
      var req = http.request(options, function (res) {
        var code = res.statusCode;
        if(code==200){
          res.setEncoding('utf8');
          var resdata = '';
          res.on('data', function (chunk) {
            resdata = resdata + chunk;
          });
          res.on('end', function () {
            var data = eval("("+resdata+")");
            var ret = data.data?(data.data.definition?data.data.definition:''):'';
            if(ret!=''){
              callback(content+"\n"+ret);
            }else{
              googleTranslate(content,'zh',callback);
            }
          });
        }else{
          googleTranslate(content,'zh',callback);
        }
      });
      req.on('error', function(err) {
        console.log('req err:');
        console.log(err);
      });
      req.end();
    }else{
      googleTranslate(content,'zh',callback);
    }
  }else if(tolan=='ja'||tolan=='en'){
    googleTranslate(content,tolan,callback);
  }else{
    ret = '出错了喵';
    callback(ret);
  }
}


var HttpsProxyAgent = require('https-proxy-agent')
var proxy = 'http://192.168.17.62:3128';
var agent = new HttpsProxyAgent(proxy);
var fs = require('fs');
//var gkey = fs.readFileSync('./gkey.txt','utf-8');
zlib = require('zlib');

function googleTranslate(content,tolan,callback){
  var option = {
    host: 'translate.googleapis.com',
    port: 443,
    method: 'GET',
    agent:agent,
    headers:{
      'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    },
    path: '/translate_a/single?client=gtx&sl=auto&tl='+tolan+'&dt=t&q='+encodeURIComponent(content)
  };
  var req = https.request(option, function(res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });
    res.on('end', function () {
      var data=eval("("+resdata+")");
      console.log(data);
      var ret = '';
      try{
        for(var i=0;i<data[0].length;i++){
          ret=ret+data[0][i][0];
        }
      }catch(e){
        ret = '出错了喵';
      }
      callback(content+'\n          ↓\n'+ret);
    });
  })
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.end();
}

module.exports={
  translateMsg
}