var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://192.168.17.52:27050/db_bot';
var path = require('path');
var request = require("request");
var fs = require('fs');


var udb;
initDB();
function initDB(){
  MongoClient.connect(mongourl, function(err, db) {
    udb=db;
  });
}



let saveImage = function(url){
  var now = new Date();
  var rd = Math.floor(Math.random()*8888+1000);
  var filename = "../coolq-data/cq/data/image/send/save/"+now.getTime()+rd+".png";
  var req = request({
    url: url,
    method: "GET"
  }, function(error, response, body){
    if(error&&error.code){
      console.log('pipe error catched!')
      console.log(error);
    }
  }).pipe(fs.createWriteStream(filename));
  req.on('close',function(){
    console.log(filename);
  });
  var image = '[CQ:image,file=send/save/'+now.getTime()+rd+'.png]';
  return image;
}


saveTxt = function(ask,answer,name,groupName,callback,from,groupid){
  MongoClient.connect(mongourl, function(err, db) {
    if(err){
      console.log('mongo error1:!!!!!!!!!')
      console.log(err);
    }else {
      var cl_txt = db.collection('cl_txt');
      ask = ask.trim();
      answer = answer.trim();

      var ra = "";
      var s1 = answer;
      var n = s1.indexOf("[CQ:image");
      var imglist = [];
      while (n >= 0) {
        var n1 = s1.indexOf(']');
        var head = s1.substring(0, n);
        var tail = s1.substring(n1 + 1);
        var image = s1.substring(n, n1 + 1);
        var n2 = image.indexOf("https://gchat.qpic.cn");
        if (n2 > 0) {
          var n3 = image.indexOf("?");
          var url = image.substring(n2, n3);
          image = saveImage(url);
          imglist.push(image);
        }
        s1 = tail;
        n = s1.indexOf("[CQ:image");
        ra = ra + head + image;
      }
      ra = ra + s1;
      if(ask.startsWith("图")&&ask.length==2&&imglist.length>0){
        var sets = ask.substring(1,2);
        var seti = parseInt(sets);
        if(seti>1&&seti<6){
          var cl_stu = db.collection('cl_stu_'+sets);
          for(var i=0;i<imglist.length;i++){
            var img = imglist[i];
            cl_stu.save({'_id':img,ts:new Date()})
          }

          callback('图' +seti+ '添加成功');
        }
      }else{
        var query = {'_id': groupid+"_"+ask};
        cl_txt.findOne(query, function (err, data) {
          if(err){
            console.log('mongo erro3r:!!!!!!!!!');
          }else {
            if (data) {
              if (data.lock) {
                if (from == 0) {
                  save(ask, ra, callback, cl_txt, name, groupName, db, from, groupid);
                } else {
                  callback('记住 "' + ask + '" 了哇');
                }
              } else {
                save(ask, ra, callback, cl_txt, name, groupName, db, from, groupid);
              }
            } else {
              save(ask, ra, callback, cl_txt, name, groupName, db, from, groupid);
            }
          }
        });
      }


    }
  });
}

function save(ask,answer,callback,cl_txt,name,groupName,db,from,groupid){
  if(ask.length>0){
    if(answer==""){
      cl_txt.remove({'_id':groupid+"_"+ask});
      callback('忘记 "'+ask+'" 了哇');
    }else{
      var data = {'_id':groupid+"_"+ask,d:answer,n:name,g:groupName,gid:groupid};
      if(from==0){
        data.lock=1;
        data.all=1;
      }
      if(ask=="rankkey"){
        delete(data["lock"]);
        delete(data["all"]);
      }
      cl_txt.save(data);
      callback('记住 "'+ask+'" 了哇');
    }
  }
  db.close();
}

var mem={};
answer = function(ask,name,groupName,callback,groupid,from){
  const {reply} = require('../baibai2');
  var Ncallback = function(ret){
    var first = ret.substring(0,1);
    if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){
      reply(ret.substring(1),name,callback,groupid,from,groupName,name);
    }else{
      callback(ret);
    }
  }
  if(ask.length>0&&udb){
    var cl_txt = udb.collection('cl_txt');
    var query = {'_id':groupid+"_"+ask};
    cl_txt.findOne(query, function(err, data) {
      if(err){
        console.log('mongo error2:!!!!!!!!!');
        console.log(err);
      }else {
        if (data) {
          if (data.all || data.g == groupName || data.gid == groupid) {
            var thend = mem[name];
            var now = new Date().getTime();
            if (thend) {
              var then = thend.ts;
              var tc = thend.c;
              if (now - then > 60000) {
                mem[name] = {ts: now, c: 1};
                Ncallback(data.d);
              } else if (now - then > 2000 * tc - 1000) {
                mem[name] = {ts: now, c: tc + 1};
                Ncallback(data.d);
              } else {
                //
              }
            } else {
              mem[name] = {ts: now, c: 1};
              Ncallback(data.d);
            }
            console.log(name, mem[name]);
          }
        }
      }
    });
  }
}

module.exports = {
  saveTxt,
  answer
};


