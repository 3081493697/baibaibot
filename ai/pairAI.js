var https=require('https');
var http = require('http');


function pairReply(content,UserName,callback){
  if(content.length<3||content.length>15){

  }else{
    var url = 'http://duilian.msra.cn/app/CoupletsWS_V2.asmx/GetXiaLian';
    var xlocker = "";
    for(var i=0;i<content.length;i++){
      xlocker=xlocker+"0";
    }
    var obj = {};
    obj.shanglian=content;
    obj.xialianLocker=xlocker;
    obj.isUpdate=false;

    var options = {
      host: 'duilian.msra.cn',
      port: 80,
      path: '/app/CoupletsWS_V2.asmx/GetXiaLian',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        var data = eval('('+resdata+')');
        var XialianSystemGeneratedSets=data.d.XialianSystemGeneratedSets;
        var XialianCandidates=XialianSystemGeneratedSets[0].XialianCandidates;
        var ret = XialianCandidates[Math.floor(Math.random()*XialianCandidates.length)];
        callback(ret);
      });
    });
    req.write(JSON.stringify(obj));
    req.end();
  }
}

module.exports={
  pairReply
}