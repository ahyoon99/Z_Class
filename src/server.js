import http, { request } from "http";
import socketIO from "socket.io";
import express, { application } from "express";
import webRTC from "wrtc";
import fs from "fs";
import axios from "axios";

const app = express();
const ejs = require("ejs");
const bodyParser = require('body-parser');


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

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');


app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");

//app.use(미들웨어); 요청-응답 중간에 뭔가 실행되는 코드

app.use("/public", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:false}));   //URL 인코딩 안함
app.use(bodyParser.json()); //

app.use(session({secret : 'abcd', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.render("main"));
app.get("/sign_up.html", (req, res) => res.render("sign_up.html"));
app.get("/home", (req, res) => res.render("home.html"));
app.get("/pre_sign_up", (req, res) => res.render("pre_sign_up"));
app.get("/sign_up_info", (req, res) => res.render("sign_up_info"));
app.get("/sign_up_info_teacher", (req, res) => res.render("sign_up_info_teacher"));

//app.get("/student_enter_room", (req, res) => res.render("student_enter_room.ejs"));
// /flask 주소로 접속 시 5000번 port의 경로로 접속해서 response 받음
app.get("/flask", async (req, res) => {
  const response = await axios.get("http://127.0.0.1:5000/flask");
  console.log(response.data);

  // response.data 값을 client에게 보내줌
  res.send(response.data);
});


//logIn 주소로 get요청 받으면 이 부분 실행
app.get('/logIn',(req,res)=>{
  res.render('/');
})

//logIn 주소로 post요청 받으면 이 부분 실행
app.post("/logIn",passport.authenticate('local',{
  failureRedirect : '/fail' //회원 인증 실패하면 /fail로 이동

}), (req,res)=>{
  //회원 인증 성공하면 redirect
  if(req.user.type==='teacher')
  {
    //선생인 경우
    res.redirect('teacher_enter_room');
  }
  else{
    //학생인 경우.
    res.redirect('student_enter_room');
  }

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
});

app.get('/teacher_enter_room', 로그인했니, function (요청, 응답) {
  console.log(요청.user); //요청.user에 deserialize로얻은 사용자의 정보 담겨있음

  응답.render('teacher_enter_room.ejs', {사용자 : 요청.user});
})

app.get('/student_enter_room', 로그인했니, function (요청, 응답) {
  console.log(요청.user); //요청.user에 deserialize로얻은 사용자의 정보 담겨있음

  응답.render('student_enter_room.ejs', {사용자 : 요청.user});
})

function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    next()
  } else {
    응답.send('로그인안하셨는데요?')
  }
}

passport.use(new LocalStrategy({
  usernameField: 'id',    //form에서 id라는 이름을 가진 것
  passwordField: 'pw',    //form에서 pw라는 이름을 가진 것.
  session: true,          //로그인 후 세션을 저장할 것인지
  passReqToCallback: false,     //아이디, 비번 말고도 다른 정보 검증시 true로 바꾸고, funciton안에 파라미터 넣어주면 됨 
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('members').findOne({ name: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.password) {
      //DB에 아이디가 있으면, 입력한 비번과 결과.pw 비교
      return done(null, 결과)   //done(서버에러,성공시 사용자 DB 데이터,에러메세지);
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

//세션 만들기 - 로그인 성공시 발동
passport.serializeUser(function (user, done) {
  done(null, user.name)
});

//이러한 세션 데이터를 가진 사람을 DB에서 찾아주세요
passport.deserializeUser(function (id, done) {
  //db에서 위에 있는 user.id 로 유저를 찾은 뒤에, 유저 정 done(null,{여기에 넣음});
  db.collection('members').findOne({name:id},function(에러,결과){
    done(null, 결과)
  })
}); 

//create course로 입장 시 실행.
app.get('/create_course',function(req,res){
    db.collection('members').find().toArray(function(err,result){
    //console.log(result)
    res.render('create_course.ejs',{students:result})
    //create course 렌더링과 동시에 array값들 넘겨줌
   // res.render('create_course.ejs');
    })
});
// app.get('/student_enter_room',function(req,res){
//   res.render('student_enter_room.ejs',{member_id : req.user});
// })
//api/course 즉 강의개설 post 요청시 실행.
app.post('/api/courses',function(req,res){
  db.collection('course_counter').findOne({name:'Total Course'},function(err,result){
    var total_course = result.totalCourse;

    //course에 내가 받은 req 넣음.
    db.collection('courses').insertOne({
      _id:(total_course+1),
      title:req.body.title,
      day:req.body.day,
      start_time:req.body.start_time,
      check_student : req.body.check_student
      
    },function(err,result){
      db.collection('course_counter').updateOne({name:'Total Course'},{$inc:{totalCourse:1}},function(err,result){
        if(err){return console.log(err)} 
        console.log(req.body);
        //res.send("<script>alert('개설 되었습니다.');</script>");
        res.redirect('/');  //요청 성공. 응답코드 200은 성공, 400은 실패
      }
      )
    });

  })
  
})

// app.post('/api/course',(req,res)=>
// {
//   res.send('전송완료');
//   console.log(req.body);
// })

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
  socket.join("Class");

  socket.on("signUp_getPic", (_data, _i) => {
    console.log("data 받음");
    fs.writeFile(`data/face_pic/pic${_i}.png`, _data, (_err) => {});
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
        console.log("### stream 받음");

        // track.kind를 통해 audio video 구별 가능
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
        sockets
          .filter((_socket) => _socket.id !== socket.id)
          .forEach((_socket) => {
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
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("sendIce", (_candidate) => {
    console.log("send ice candidate 받음");
    socket.receivePC.addIceCandidate(_candidate);
  });

  socket.on("receiveOffer", async (_offer, _id) => {
    try {
      console.log("receive offer 받음");
      const tempPC = {
        pc: new webRTC.RTCPeerConnection(pcConfig),
        stream: new webRTC.MediaStream(),
        id: _id,
      };
      socket.sendPCs.push(tempPC);
      tempPC.pc.onicecandidate = (_data) => {
        console.log("receive ice candidate 생성");
        if (_data.candidate) {
          console.log("receive ice candidate 송신");
          socket.emit("receiveIce", _data.candidate, _id);
        }
      };
      userStreams[_id].getTracks().forEach((_track) => {
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
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("receiveIce", (_candidate, _id) => {
    console.log("receive ice candidate 추가");
    const temp = socket.sendPCs.find((_pc) => _pc.id === _id);
    temp.pc.addIceCandidate(_candidate);
  });

  socket.on("disconnecting", () => {
    sockets = sockets.filter((_socket) => _socket.id !== socket.id);
    socket.to("Class").emit("userExit", socket.id);
  });

  socket.on("sendChat", (_msg,_id)=>{
    console.log("메시지 받음");
    socket.to("Class").emit("receiveChat", _msg, _id);
  })
});
