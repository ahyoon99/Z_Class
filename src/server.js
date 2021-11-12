import http from "http";
import socketIO from "socket.io";
import express from "express";
import webRTC from "wrtc";
import fs from "fs";
import axios from "axios";
import ejs from "ejs";

const app = express();

const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);

httpServer.listen(3000);


app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");


app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}));       // 수정 - 최신 express에는 body-parser가 이미 포함
app.use(express.json());


// ############  mongoDB 연동  ############
const mongoose = require('mongoose');
const database = mongoose.connection;
const database_address = 'mongodb+srv://ahyoon:0412@cluster0.gbv0x.mongodb.net/Z-Class?retryWrites=true&w=majority';

// mongo DB와 주소를 이용해서 연결함
mongoose
    .connect(database_address)
    .then(()=>{
        console.log("#####  db connected  #####");
    })
    .catch((e) => console.log(e));


// ############  session 설정  ############
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: "MxIDI8WWNrl8mu8VvWJzk718vwR9bt",   // 암호화 하는 seed
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({                  // 세션 정보를 mongo DB에 저장
        mongoUrl: database_address,
        ttl: 24 * 60 * 60,                     // 세션 정보 db에 2주간 유지
        collectionName: "sessions",                 // db의 'session' collection에 저장
        autoRemove: 'native'
    })
}));


// ############  router  #############

// # 메인 화면 #            로그인 전, 회원 가입, 아이디 or 비밀번호 찾기에 사용
const mainRouter = require('./routes/main');
app.use('/', mainRouter);

// # 로그인 후 화면 #       학생의 경우 수업에 접속, 선생님의 경우에는 강의 개설 및 설정 화면 / 추가적으로 회원 탈퇴 or 정보 수정   
const waiting_roomRouter = require('./routes/waiting_room');
app.use('/waiting_room', waiting_roomRouter);

// # 강의 화면 #            같은 강의에 속한 학생과 선생님이 화상 수업을 하는 페이지
const classRouter = require('./routes/class');
app.use('/class', classRouter);



// $$$$$$$$$$$$$$$ 얼굴 인식 모듈 추가 시 사용 예정
// /flask 주소로 접속 시 5000번 port의 경로로 접속해서 response 받음
app.get("/flask", async (req, res) => {
    const response = await axios.get("http://127.0.0.1:5000/flask");
    console.log(response.data);

    // response.data 값을 client에게 보내줌
    res.send(response.data);
});


//  ######## socket.io 관련 부분  #########

let sockets = []; // 연결된 socket들을 저장하는 배열
let userStreams = {}; // sendPC로부터 받아온 stream을 저장

const pcConfig = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302"]
        }
    ]
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
                socket
                    .to("Class")
                    .emit("newUserJoined", socket.id);
                // 기존 접속자들의 영상 얻기
                sockets
                    .filter((_socket) => _socket.id !== socket.id)
                    .forEach((_socket) => {
                        socket.emit("addOldUser", _socket.id);
                    });
            };

            await socket
                .receivePC
                .setRemoteDescription(_offer);
            const answer = await socket
                .receivePC
                .createAnswer({offerToReceiveAudio: true, offerToReceiveVideo: true});
            await socket
                .receivePC
                .setLocalDescription(answer);
            console.log("send answer 보냄");
            socket.emit("sendAnswer", answer);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("sendIce", (_candidate) => {
        console.log("send ice candidate 받음");
        socket
            .receivePC
            .addIceCandidate(_candidate);
    });

    socket.on("receiveOffer", async (_offer, _id) => {
        try {
            console.log("receive offer 받음");
            const tempPC = {
                pc: new webRTC.RTCPeerConnection(pcConfig),
                stream: new webRTC.MediaStream(),
                id: _id
            };
            socket
                .sendPCs
                .push(tempPC);
            tempPC.pc.onicecandidate = (_data) => {
                console.log("receive ice candidate 생성");
                if (_data.candidate) {
                    console.log("receive ice candidate 송신");
                    socket.emit("receiveIce", _data.candidate, _id);
                }
            };
            userStreams[_id]
                .getTracks()
                .forEach((_track) => {
                    tempPC
                        .pc
                        .addTrack(_track);
                });

            await tempPC
                .pc
                .setRemoteDescription(_offer);
            const answer = await tempPC
                .pc
                .createAnswer({offerToReceiveAudio: false, offerToReceiveVideo: false});
            await tempPC
                .pc
                .setLocalDescription(answer);
            socket.emit("receiveAnswer", answer, _id);
            console.log("receive answer 보냄");
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("receiveIce", (_candidate, _id) => {
        console.log("receive ice candidate 추가");
        const temp = socket
            .sendPCs
            .find((_pc) => _pc.id === _id);
        temp
            .pc
            .addIceCandidate(_candidate);
    });

    socket.on("disconnecting", () => {
        sockets = sockets.filter((_socket) => _socket.id !== socket.id);
        socket
            .to("Class")
            .emit("userExit", socket.id);
    });

    socket.on("sendChat", (_msg, _id) => {
        console.log("메시지 받음");
        socket
            .to("Class")
            .emit("receiveChat", _msg, _id);
    })
});
