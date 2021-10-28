import http from "http";
import socketIO from "socket.io";
import express from "express";
import webRTC from "wrtc";
import fs from "fs";

const app = express();

app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("main.html"));
app.get("/sign_up.html", (req, res) => res.render("sign_up.html"));
app.get("/home", (req, res) => res.render("home.html"));

const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);

httpServer.listen(3000);




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
