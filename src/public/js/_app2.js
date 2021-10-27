const socket = io();


const startBtn = document.querySelector("#start");
startBtn.addEventListener("click", StartChat);

let myStream;
let pc;
let newStream;

// 비디오와 오디오를 받아옴
async function GetMyStream() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log('@@@user device 읽음');
    await CreatePC();
    myStream.getTracks().forEach((track)=>{
      pc.addTrack(track);
    })
    startBtn.disabled = false;
  } catch (e) {
    console.log(e);
  }
}

GetMyStream();

function StartChat() {
  startBtn.disabled = true;
  console.log("Chat Start");
  CreateOffer();
}

function CreatePC() {
  pc = new RTCPeerConnection();
  pc.onnegotiationneeded = ()=>{
  };

  pc.onicecandidate = (_data) => {
    console.log("candidate 생성");
    if (_data.candidate) {
      console.log("candidate 보냄");
      socket.emit("ice", _data.candidate);
    }
  };


  pc.ontrack = (_data) =>{
      console.log("track 받음");
      if(!newStream){
        newStream = new MediaStream();
        newStream.addTrack(_data.track);
      }
      else{
        newStream.addTrack(_data.track);
        const peerFace = document.createElement("video");
        peerFace.setAttribute("id", "myVideo");
        peerFace.setAttribute("playsinline", "");
        peerFace.setAttribute("autoplay", "");
        peerFace.setAttribute("controls", "false");
        peerFace.setAttribute("width", "480");
        peerFace.setAttribute("height", "320");
        peerFace.srcObject = newStream;
        videoDiv.appendChild(peerFace);
        console.log("생성");
        newStream=null;
      }
  };
}

async function CreateOffer(){
  try{
    console.log("offer 송신");
    const offer = await pc.createOffer(
      
      //{
      //offerToReceiveAudio:false,
      //offerToReceiveVideo:false,
      //}
    );
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }catch(e){
    console.log(e);
  }
}

socket.on("answer", async (_answer)=>{
  try{
      console.log("answer 수신");
      await pc.setRemoteDescription(_answer);
      socket.emit('newEnter');
  }catch(e){
    console.log(e);
  }
});

socket.on("ice", async (_candidate)=>{
  try{
    await pc.addIceCandidate(_candidate);
    console.log("candidate 받음");
  } catch(e){
    console.log(e);
  }
});

socket.on("log", (_data)=>{
  console.log(_data);
});