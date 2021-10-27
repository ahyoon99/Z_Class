import http from "http";
import socketIO from "socket.io";
import express from "express";
import webRTC from "wrtc";

const app = express();

app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home.html"));

const httpServer = http.createServer(app);
const wsServer = socketIO(httpServer);

let users = [];
let streams = [];

wsServer.on("connection", (socket) => {
  users.push(socket);

  socket.sendPC = new webRTC.RTCPeerConnection({
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
  });

  socket.sendPC.onicecandidate = (_data) => {
    if (_data.candidate) {
      console.log("receive candidate 보냄");
      socket.emit("receiveIce", _data.candidate);
    }
  };

  streams.forEach((_stream) => {
    _stream.getTracks().forEach((_track) => {
      socket.sendPC.addTrack(_track, _stream);
    });
  });


  socket.receivePC = new webRTC.RTCPeerConnection({
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
  });

  socket.receivePC.onicecandidate = (_data) => {
    console.log("AAA");
    if (_data.candidate) {
      console.log("send candidate 보냄");
      socket.emit("sendIce", _data.candidate);
    }
  };
  socket.receivePC.ontrack = (_data) => {
    streams.push(_data.stream);
  };






  
  socket.on("receiveOffer", async (_data) => {
    try {
      console.log("receive offer 받음");
      await socket.sendPC.setRemoteDescription(_data);
      const answer = await socket.sendPC.createAnswer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await socket.sendPC.setLocalDescription(answer);
      socket.emit("receiveAnswer", answer);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("receiveIce", async (_candidate) => {
    try {
      await socket.sendPC.addIceCandidate(_candidate);
      console.log("receive candidate 받음");
    } catch (e) {
      console.log(e);
    }
  });


  socket.on("sendOffer", async (_data) => {
    try {
        console.log("send offer 받음");
      await socket.receivePC.setRemoteDescription(_data);
      const answer = await socket.receivePC.createAnswer({
     offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await socket.receivePC.setLocalDescription(answer);
      socket.emit("sendAnswer", answer);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("sendIce", async (_candidate) => {
    try {
      await socket.receivePC.addIceCandidate(_candidate);
      console.log("send candidate 받음");
    } catch (e) {
      console.log(e);
    }
  });
});

httpServer.listen(8000);

/*const pc = new webRTC.RTCPeerConnection({
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
  });
  socket.pc = pc;

  pc.onicecandidate = (_data) => {
    if (_data.candidate){
    console.log("sent candidate");
        socket.emit("ice", _data.candidate);
    }
    
  }
  pc.ontrack =  (_data) => {
    users.forEach((user)=>{
        console.log(_data.track);
        user.pc.addTrack(_data.track);
    })
  }

  socket.on("offer", async (_offer) => {
    console.log("offer received");
    socket.pc.setRemoteDescription(_offer);
    const answer = await socket.pc.createAnswer();
    socket.pc.setLocalDescription(answer);
    socket.emit("answer", answer);
    console.log("answer sent");
    console.log("");
  });

  socket.on("ice", (_candidate) => {
    console.log("candidate received : ");
    console.log("");

    if (_candidate) socket.pc.addIceCandidate(_candidate);
  });
  */
