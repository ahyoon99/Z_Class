import http from "http";
import socketIO from "socket.io";
import express from "express";
import webRTC from "wrtc";
import fs from "fs";

const app = express();
const ejs = require("ejs");
const bodyParser = require('body-parser');

app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended:false}));   //URL 인코딩 안함
app.use(bodyParser.json()); 
app.get("/", (req, res) => res.render("main"));
app.get("/sign_up.html", (req, res) => res.render("sign_up.html"));
app.get("/home", (req, res) => res.render("home.html"));
app.get("/pre_sign_up", (req, res) => res.render("pre_sign_up"));
app.get("/sign_up_info", (req, res) => res.render("sign_up_info"));
app.get("/sign_up_info_teacher", (req, res) => res.render("sign_up_info_teacher"));


const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);

httpServer.listen(3000);

var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://ahyoon:0412@cluster0.gbv0x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{useUnifiedTopology:true},function(err,client){
  if(err) return console.log(err);
  db=client.db('myFirstDatabase');
  //자료추가 코드
  // db.collection('courses').insertOne({title:'영어',_id:100},function(err,result){
  //   console.log('저장완료');
  // })
  console.log('Mongo db connect');
});

app.post('/sign_up_info',function(req,res){
  console.log("post");
  db.collection('members').findOne({name:req.body.name}, function(err, result){
    if (result){  // 해당 이름을 가진 회원 존재
      var findphone = result.phone_number;
      if( req.body.phone_number ==findphone){
        // 중복된 회원
        console.log('중복');
        res.write('<script type="text/javascript">alert("already existed");</script>');
        res.write('<script>window.location=\"sign_up_info\"</script>"');
      }
      else{ // 해당 이름을 가진 회원은 존재, 하지만 번호는 다름, post해도 됨
        db.collection('members_counter').findOne({name:'totalMembers'},function(err,result){
          var total_students = result.totalMembers;
          db.collection('members').insertOne({
            _id:(total_students+1),
            name:req.body.name,
            password : req.body.password,
            grade : req.body.grade,
            phone_number : req.body.phone_number,
            type : "student"
          },function(err,result){
            db.collection('members_counter').updateOne({name:'totalMembers'},{$inc:{totalMembers:1},function(err,result){
              if(err){return console.log(err)} 
              console.log('저장완료');
              res.send('전송완료');
            }
            })
          });
      
        })
        res.write('<script type="text/javascript">alert("sign up successfully");</script>');
        res.write('<script>window.location=\"sign_up.html\"</script>"');
      }
    }
    else{ // 해당 이름을 가진 회원 존재하지 않음.
      db.collection('members_counter').findOne({name:'totalMembers'},function(err,result){
        var total_students = result.totalMembers;
        db.collection('members').insertOne({
          _id:(total_students+1),
          name:req.body.name,
          password : req.body.password,
          grade : req.body.grade,
          phone_number : req.body.phone_number,
          type : "student"
        },function(err,result){
          db.collection('members_counter').updateOne({name:'totalMembers'},{$inc:{totalMembers:1},function(err,result){
            if(err){return console.log(err)} 
            console.log('저장완료');
            res.send('전송완료');
          }
          })
        });
      })
      res.write('<script type="text/javascript">alert("sign up successfully");</script>');
      res.write('<script>window.location=\"sign_up.html\"</script>"');
    }
  });
})

app.post('/sign_up_info_teacher',function(req,res){
  console.log("post");

  db.collection('members').findOne({name:req.body.name}, function(err, result){
    if(result){ // 중복된 이름 존재
      var findphone = result.phone_number;
      if( req.body.phone_number ==findphone){ // 중복된 이름+중복된 번호 -> 회원가입 불가
        // 중복된 회원
        console.log('중복');
        res.write('<script type="text/javascript">alert("already existed");</script>');
        res.write('<script>window.location=\"\"</script>"');
     }
     else{  // 이름은 중복, 번호는 중복 x
      db.collection('members_counter').findOne({name:'totalMembers'},function(err,result){
        var total_students = result.totalMembers;
        db.collection('members').insertOne({
          _id:(total_students+1),
          name:req.body.name,
          password : req.body.password,
          grade : req.body.grade,
          phone_number : req.body.phone_number,
          type : "teacher"
        },function(err,result){
          db.collection('members_counter').updateOne({name:'totalMembers'},{$inc:{totalMembers:1},function(err,result){
            if(err){return console.log(err)} 
            console.log('저장완료');
            res.send('전송완료');
          }
          })
        });
      })
      res.write('<script type="text/javascript">alert("sign up successfully");</script>');
      res.write('<script>window.location=\"/\"</script>"');
     }
    }
    else{ // 중복된 이름 존재하지 않음
      db.collection('members_counter').findOne({name:'totalMembers'},function(err,result){
        var total_students = result.totalMembers;
        db.collection('members').insertOne({
          _id:(total_students+1),
          name:req.body.name,
          password : req.body.password,
          grade : req.body.grade,
          phone_number : req.body.phone_number,
          type : "teacher"
        },function(err,result){
          db.collection('members_counter').updateOne({name:'totalMembers'},{$inc:{totalMembers:1},function(err,result){
            if(err){return console.log(err)} 
            console.log('저장완료');
            res.send('전송완료');
          }
          })
        });
      })
      res.write('<script type="text/javascript">alert("sign up successfully");</script>');
      res.write('<script>window.location=\"/\"</script>"');
    }
  });
})

let sockets = [];           // 연결된 socket들을 저장하는 배열
let userStreams = {};       // sendPC로부터 받아온 stream을 저장

const pcConfig = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
};


wsServer.on("connection", (socket) => {
    // 초기화
    userStreams[socket.id] = new webRTC.MediaStream();
    socket.sendPCs = [];

    socket.on("signUp_getPic", (_data, _i)=>{
      console.log("data 받음");
      fs.writeFile(`pic${_i}.png`,_data,(_err)=>{});


    });



    // client의 offer 받고 answer 보냄
    socket.on("sendOffer", async (_offer) => {
    try {
        sockets.push(socket);
      console.log("send offer 받음");
      socket.receivePC = new webRTC.RTCPeerConnection(pcConfig);
      socket.receivePC.onicecandidate = (_data) => {
        console.log("send ice candidate 생성");
        if (_data.candidate) {
          console.log("send ice candidate 송신");
          socket.emit("sendIce", _data.candidate);
        }
      };
      socket.receivePC.ontrack = (_data) => {
        console.log("데이터 받음");
        /*
        if (_data.track.kind === "audio") {
          socket.audioTrack = _data.track;
          console.log("audio 트랙 넣음");
        } else if (_data.track.kind === "video") {
          socket.videoTrack = _data.track;
          console.log("video 트랙 넣음");
        }
        */
       //stream에 track 추가
       userStreams[socket.id].addTrack(_data.track);
        // 데이터 넣는 것을 완료한 뒤에 기존 접속자에게 새로운 접속자의 mediastream을 받을 연결 생성
        socket.to("Class").emit("newUserJoined", socket.id);
        // 기존 접속자들의 영상 얻기
        sockets.filter((_socket)=>_socket.id !==socket.id)
        .forEach((_socket)=>{
            socket.emit("addOldUser", _socket.id);
        });
      };

      await socket.receivePC.setRemoteDescription(_offer);
      const answer = await socket.receivePC.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await socket.receivePC.setLocalDescription(answer);
      console.log("send answer 보냄");
      socket.emit("sendAnswer", answer);
      socket.join("Class");
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("sendIce", (_candidate) => {
    console.log("send ice candidate 받음");
    socket.receivePC.addIceCandidate(_candidate);
  });

  socket.on("receiveOffer", async (_offer, _id)=>{
    try{
        console.log("receive offer 받음");
        const tempPC = {pc: new webRTC.RTCPeerConnection(pcConfig), stream: new webRTC.MediaStream(),id: _id};
        socket.sendPCs.push(tempPC);
        tempPC.pc.onicecandidate = (_data)=>{
            console.log("receive ice candidate 생성");
            if (_data.candidate) {
              console.log("receive ice candidate 송신");
              socket.emit("receiveIce", _data.candidate, _id);
            }
          };
        userStreams[_id].getTracks().forEach((_track)=>{
            tempPC.pc.addTrack(_track);
        });

        await tempPC.pc.setRemoteDescription(_offer);
        const answer = await tempPC.pc.createAnswer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false,
        });
        await tempPC.pc.setLocalDescription(answer);
        socket.emit("receiveAnswer", answer, _id);
        console.log("receive answer 보냄");

    }catch(e){
        console.log(e);
    }
  });

  socket.on("receiveIce", (_candidate, _id)=>{
    console.log("receive ice candidate 추가");
    const temp = socket.sendPCs.find((_pc)=>_pc.id === _id);
    temp.pc.addIceCandidate(_candidate);
  });



  socket.on("disconnecting",()=>{
      sockets = sockets.filter((_socket)=>_socket.id !== socket.id)
      socket.to("Class").emit("userExit", socket.id);
  })

});
