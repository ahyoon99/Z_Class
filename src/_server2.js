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

httpServer.listen(8000);

let sockets = [];
let tracks = [];

wsServer.on("connection", (socket)=>{
    sockets.push(socket);
    socket.pc = new webRTC.RTCPeerConnection({
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

      sockets.forEach((_socket)=>{
          console.log("추가체크");
          if(_socket.videoTrack){
            console.log("추가됨");
            socket.pc.addTrack(_socket.videoTrack);
          }
            if(_socket.audioTrack){
            console.log("추가됨");
            socket.pc.addTrack(_socket.audioTrack);
            }
      });

    socket.pc.onicecandidate = (_data) =>{
        console.log("candidate 생성");
        if(_data.candidate){
            console.log("candidate 전송");
            socket.emit("ice", _data.candidate);
        }
    }
    socket.pc.ontrack = (_data)=>{
        console.log("데이터 받음");
        if(_data.track.kind === 'audio'){
            socket.audioTrack = _data.track;
            console.log("데이터 넣음");
        }
        else if(_data.track.kind === 'video'){
            socket.videoTrack = _data.track;
            console.log("데이터 넣음");

        }
    }

    socket.on("offer", async (_offer)=>{
        try{
            console.log("offer 받음");
            await socket.pc.setRemoteDescription(_offer);
            const answer = await socket.pc.createAnswer();
            await socket.pc.setLocalDescription(answer);
            socket.emit("answer", answer);
        }
        catch(e){
            console.log(e);
        }

    });
    
    socket.on("ice", async (_candidate)=>{
        try{
            await socket.pc.addIceCandidate(_candidate);
            console.log("candidate 받음");
        }catch(e){
            console.log(e);
        }
    });
    socket.on('newEnter',()=>{
        sockets.filter(_socket => socket.id !== _socket.id)
        .forEach((_socket)=>{
                _socket.pc.addTrack(socket.videoTrack);
                _socket.pc.addTrack(socket.audioTrack);
                console.log("기존사용자에게 추가");
                const newStream = new MediaStream();
                newStream.
                _socket.pc.replaceTrack()
        });
    });




});





