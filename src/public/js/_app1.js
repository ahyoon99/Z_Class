const socket = io();

const videoDiv = document.querySelector("div");

let myStream;
let sendPC;
let receivePC;

const startBtn = document.querySelector("#start");
startBtn.addEventListener("click", StartChat);

GetMyStream();

async function GetMyStream() {
  const defaultConstrains = { audio: true, video: { facingMode: "user" } };

  /*
   const myFace = document.createElement("video");
  myFace.setAttribute("id", "myVideo");
  myFace.setAttribute("playsinline", "");
  myFace.setAttribute("autoplay", "");
  myFace.setAttribute("controls", "false");
  myFace.setAttribute("width", "480");
  myFace.setAttribute("height", "320");
*/

  try {
    myStream = await navigator.mediaDevices.getUserMedia(defaultConstrains);
    myStream.getAudioTracks()[0].enabled = false;
    //myFace.srcObject = myStream;
    startBtn.disabled = false;
    //videoDiv.appendChild(myFace);
  } catch (e) {
    console.log(e);
  }
}

function StartChat() {
    startBtn.disabled = true;
    console.log("Chat Start");
    CreateReceivePC();
    CreateReceiveOffer();
    GetMyStream();
    CreateSendPC();
    CreateSendOffer();
}

function CreateReceivePC() {
  receivePC = new RTCPeerConnection({
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

  receivePC.onicecandidate = (_data) => {
    if (_data.candidate) {
      console.log("receive candidate sent\n");
      socket.emit("receiveIce", _data.candidate);
    }
  };
  receivePC.ontrack = (_data) => {
    console.log("receive track got");
    _data.streams.forEach((_stream) => {
      const peerFace = document.createElement("video");
      peerFace.setAttribute("id", "myVideo");
      peerFace.setAttribute("playsinline", "");
      peerFace.setAttribute("autoplay", "");
      peerFace.setAttribute("controls", "false");
      peerFace.setAttribute("width", "480");
      peerFace.setAttribute("height", "320");
      peerFace.srcObject = _stream;
      videoDiv.appendChild(peerFace);
    });
  };
}

async function CreateReceiveOffer() {
  try {
    console.log("receive offer sent");
    const offer = await receivePC.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await receivePC.setLocalDescription(offer);
    socket.emit("receiveOffer", offer);
  } catch (e) {
    console.log(e);
  }
}

socket.on("receiveAnswer", async (_data) => {
  try {
    console.log("receive Answer 받음");
    await receivePC.setRemoteDescription(_data);
  } catch (e) {
    console.log(e);
  }
});

socket.on("receiveIce", async (_candidate) => {
  try {
    receivePC.addIceCandidate(_candidate);
    console.log("receive candidate 받음");
  } catch (e) {
    console.log(e);
  }
});

function CreateSendPC() {
  sendPC = new RTCPeerConnection({
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
  sendPC.onicecandidate = (_data) => {
    console.log("AAA");
    if (_data.candidate) {
      socket.emit("sendIce", _data.candidate);
      console.log("send candidate 보냄");
    }
  };
}

async function CreateSendOffer() {
  try {
    console.log("send offer sent");
    const offer = await sendPC.createOffer({
    offerToReceiveAudio: false,
   offerToReceiveVideo: false,
    });
    await sendPC.setLocalDescription(offer);
    socket.emit("sendOffer", offer);
  } catch (e) {
    console.log(e);
  }
}

socket.on("sendAnswer", async (_data) => {
  try {
    console.log("send Answer 받음");
    await sendPC.setRemoteDescription(_data);
  } catch (e) {
    console.log(e);
  }
});

socket.on("sendIce", async (_candidate) => {
  try {
    sendPC.addIceCandidate(_candidate);
    console.log("send candidate 받음");
  } catch (e) {
    console.log(e);
  }
});

/*
async function StartChat() {
  startBtn.disabled = true;
  console.log("Chat Start");
  pc = new RTCPeerConnection({
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
  pc.onicecandidate = (_data) => {
    if(_data.candidate){
    console.log("sent candidate");
    socket.emit("ice", _data.candidate);
    }
    
  }
  pc.ontrack = (_data) => {
    console.log("비디오");

    const peerFace = document.createElement("video");
    peerFace.setAttribute("id", "myVideo");
    peerFace.setAttribute("playsinline", "");
    peerFace.setAttribute("autoplay", "");
    peerFace.setAttribute("controls", "false");
    peerFace.setAttribute("width", "480");
    peerFace.setAttribute("height", "320");
    peerFace.srcObject = _data.streams[0];
    peerFace.appendChild(myFace);
  }

  pc.addTrack(myStream.getTracks()[0], myStream);
  const offer = await pc.createOffer();
  pc.setLocalDescription(offer);
  console.log("offer sent");
  socket.emit("offer", offer);
}

socket.on("answer", (_answer)=>{
  console.log("answer received");
  pc.setRemoteDescription(_answer);

});

  socket.on("ice", (_candidate)=>{
      console.log("candidate received");
      pc.addIceCandidate(_candidate);
  });

  */
