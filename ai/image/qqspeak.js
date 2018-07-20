var https = require('https');
var crypto = require('crypto');
var appid = 1107054322;
var appkey = 'Yw6WKnq3It2cnUqn';

function descryptReply(content,callback){
  if(content.indexOf('[CQ:image')>=0){
    var n1 = content.indexOf('https://gchat.qpic');
    var s1 = content.substring(n1);
    var n2 = s1.indexOf('?');
    var url = s1.substring(0,n2);
    getdescrpt(url,function(text){
      callback('[CQ:image,file='+url+']\n'+text);
    })
  }
}


function getdescrpt(imgurl,callback){
  imgurl = 'https://gchat.qpic.cn/gchatpic_new/357474405/568281876-2924256116-AABEA9FF00CF5CF216E48379CA47B03A/0?vuin=2375373419&term=2';
  var url = 'https://ai.qq.com/cgi-bin/appdemo_imgtotext'
  var options = {
    host: 'ai.qq.com',
    port: 443,
    path: '/cgi-bin/appdemo_imgtotext',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    }
  };
  var body = 'image_url='+encodeURIComponent(imgurl);
  console.log(options);
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });
    res.on('end', function () {
      var data = eval('('+resdata+')');
      console.log(resdata);
      var text = data.data.text;
      callback(text)
    });
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.write(body);
  req.end();
}

function sign(data){
  var keys = Object.keys(data);
  var str = "";
  keys.sort();
  for(var i=0;i<keys.length;i++){
    str = str + keys[i] + "=" + data[keys[i]] + "&";
  }
  str = str + "app_key="+appkey;
  console.log(str);
  var md5=crypto.createHash("md5");
  md5.update(str);
  var md5str=md5.digest('hex').toUpperCase();
  return md5str;
}


module.exports={
  getdescrpt,
  descryptReply
}