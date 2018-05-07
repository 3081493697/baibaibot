var https=require('https');
var http = require('http');
const tulingApiKey = "9cca8707060f4432800730b2ddfb029b";
const {baiduVoice} = require('../ai/voice/baiduvoice')

var limit = {};

var bosonnlp = require('bosonnlp');
var nlp = new bosonnlp.BosonNLP('A6Dvxzs0.25388.G_wPyy4DDLw-');



function tulingMsg(userid,content,callback,groupid){
  var then=limit[groupid];
  if(then){
    if(new Date().getTime()-then<3000){
      callback('太快了喵～');
      return;
    }
  }
  limit[groupid]=new Date().getTime();
  var body={};
  body.userInfo={};
  body.userInfo.apiKey=tulingApiKey;
  body.userInfo.userId=groupid;
  body.reqType=0;
  body.perception={};
  body.perception.inputText={};
  body.perception.inputText.text=content;
  var options = {
    hostname: 'openapi.tuling123.com',
    port: 80,
    path: '/openapi/api/v2',
    method: 'POST',
    headers:{
      'Content-Type':'application/json'
    }
  };
  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });

    res.on('end', function () {
      var ret = handleTulingResponse(resdata);
      if(ret.indexOf('TFboys')>0){
        ret = content;
      }
      nlp.sentiment(ret, function (data) {
        console.log(data);
        var positive = data[0][0];
        var negative = data[0][1];
        var addrate = positive-negative;

        if(groupid=='205700800'){
          callback(userid+':百百好感度'+(addrate>0?"+":"")+addrate.toFixed(4))
        }
      });
      if(Math.random()<0.5){
        baiduVoice(ret,callback);
      }else{
        callback(ret);
      }
    });
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.write(JSON.stringify(body));
  req.end();
}
var dup=0;
function handleTulingResponse(resdata){
  try{
    var data = eval("("+resdata+")");
    var code = data.intent.code;
    var ret = '';
    for(var i=0;i<data.results.length;i++){
      var value=data.results[i].values;
      var type = data.results[i].resultType;
      ret = ret + value[type]+"\n";
    }
    return ret.trim();
  }catch(e){
    console.log(e);
    console.log(data);
    return '';
  }

}

module.exports={
  tulingMsg
}
