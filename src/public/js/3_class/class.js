// 서버와 통신을 하기 위한 socket.io
const socket = io();

// STUN server, ice candidate 시 이용
const pcConfig = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302"
            ]
        }
    ]
};

let isTeacher = false;
if(document.querySelector("#container_teacher"))
    isTeacher=true;

const canvas = document.createElement("canvas");
document.getElementById("canvas").style.display = 'none';

canvas.setAttribute("width",293);
canvas.setAttribute("height",220);    

// 시작 전 사용자의 미디어를 받아오고
// 서버에 미디어를 송신하기 위한 rtcPeerConnection 생성


InitializeToStart();

async function InitializeToStart() {
    try {
        socket.emit('first_join');
        // await 이유 : offer 생성 전 stream 먼저 받아둬야함
        await GetMyStream(); 
        CreateSendOffer();
    } catch (e) {
        window.alert("사용자의 media를 얻을 수 없습니다.")
        console.log(e);
    }
}

let myStream;
let mySendPC;
let myReceivePCs = {};

const teacherMedia = document.querySelector("#teacherMedia");
teacherMedia.addEventListener("contextmenu",(event)=>{
    event.preventDefault();
});

let me;
let my_name;
let i;  // 캡쳐된 패일 넘버링을 위해 사용

async function GetMyStream() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
        console.log("@@@@@  내 stream 얻음");
    
        if(!isTeacher){
            makeMediaContainer("me", myStream, "내 이름");
            me = document.querySelector("#me");
        }
        else
            teacherMedia.srcObject = myStream;
        console.log("#####  내 video 생성");

        // constrain을 false로 줄 경우 audio 안가져오므로 true로 받아오고 enable을 꺼줌
        myStream
            .getAudioTracks()[0]
            .enabled = false;     
        }
        catch (e) {
        console.log(e);
    }
}
// 학생들 화면이 출력될 공간
const studentsMediaContainer = document.querySelector("#studentsMediaContainer");

// stream을 얻었을 경우 video 생성, 나와 다른 사람 영상 생성에 사용
function makeMediaContainer(_id, _stream, _name){
    // stream이 재생될 video
    const videoElement = document.createElement('video');
    videoElement.setAttribute("id", _id);
    videoElement.setAttribute("playsinline","");
    videoElement.setAttribute("autoplay","");
    videoElement.className="studentMedia";
    videoElement.srcObject = _stream;
    videoElement.addEventListener("contextmenu",(event)=>{
        event.preventDefault();
    });

    // 우측 아래 이름 표시
    const nameElement = document.createElement('div');
    nameElement.className="studentName";
    nameElement.innerText= _name;
    if(_id==="me")
        nameElement.innerText = "나";
        
        
    // 영상과 이름 담을 공간
    const mediaContainer = document.createElement('div');
    mediaContainer.className="studentMediaContainer";
    mediaContainer.appendChild(nameElement);
    mediaContainer.appendChild(videoElement);

    // 만들어진 컨테이너를 넣어줌
    studentsMediaContainer.appendChild(mediaContainer);
}


// ############# 내 영상을 보내기 위한 연결의 offer 생성
async function CreateSendOffer() {
    try {
        makeSendConnection();
        console.log("@@@@@  send Offer 생성");
        // 받기 위한 연결이 아니므로 false
        const offer = await mySendPC.createOffer(
            {offerToReceiveVideo: false, offerToReceiveAudio: false}
        );
        await mySendPC.setLocalDescription(offer);
        socket.emit("sendOffer", offer);
    } catch (e) {
        console.log(e);
    }
}

async function makeSendConnection() {
    mySendPC = new RTCPeerConnection(pcConfig);

    // sdp 결정 후 자신의 ice candidate 확보될 경우 이벤트 발생 ice(Interactive Connectivity
    // Establishment) peer간 ice candidate를 서로 교환하며 최적의 경로를 찾음 가능한 모든 candidate를 모두 전송
    // _data.candidate가 null인 경우도 있으므로 null이 아닌 것만 보내줘야함 서로의 ice candidate를
    // addIceCandidate 함수를 사용해 등록해주면 됨
    mySendPC.onicecandidate = (_data) => {
        // candidate가 null일 경우엔 보내지 않음
        if (_data.candidate) {
            console.log("@@@@@  send candidate 송신");
            socket.emit("sendIce", _data.candidate);
        }
    };

    // offer 생성 전 track 추가 필수
    myStream.getTracks().forEach((_track) => {
            mySendPC.addTrack(_track, myStream);
        });
}

socket.on("sendAnswer", async (_answer) => {
    try {
        console.log("@@@@@  send answer 수신");
        await mySendPC.setRemoteDescription(_answer);
    } catch (e) {
        console.log(e);
    }
});

socket.on("sendIce", (_candidate) => {
    console.log("@@@@@  send candidate 수신");
    mySendPC.addIceCandidate(_candidate);
}); 



// ################ 다른 사용자가 접속 시 or 기존에 접속한 사용자 확인

socket.on("newUserJoined", (_id, _name) => {
    if (!myReceivePCs[_id]) {
        console.log("#####  새 유저 입장");
        CreateReceiveOffer(_id, 'student', _name);
    }
});

socket.on("addOldUser", (_id, _type, _name) => {
    if (!myReceivePCs[_id]) {
        console.log(`#####  기존 유저 추가: ${_id}`);
        CreateReceiveOffer(_id, _type, _name);
    }
});

// 다른 client들의 stream을 받기 위한 연결

async function CreateReceiveOffer(_id, _type, _name) {
    try {
        await MakeReceiveConnection(_id, _type, _name);
        console.log("@@@@@  receive offer 생성");
        const offer = await myReceivePCs[_id].pc.createOffer({
            offerToReceiveVideo: true, offerToReceiveAudio: true
        });
        await myReceivePCs[_id].pc.setLocalDescription(offer);
        socket.emit("receiveOffer", offer, _id);
    } catch (e) {
        console.log(e);
    }
}
function MakeReceiveConnection(_id, _type, _name) {
    myReceivePCs[_id] = {
        pc: new RTCPeerConnection(pcConfig),
        stream: new MediaStream()
    };

    myReceivePCs[_id].pc.onicecandidate = (_data) => {
        if (_data.candidate) {
            console.log("@@@@@  receive candidate 송신");
            socket.emit("receiveIce", _data.candidate, _id);
        }
    };
    myReceivePCs[_id].pc.ontrack = (_data) => {
        console.log("#####  다른 사용지 stream 받음");
        myReceivePCs[_id].stream.addTrack(_data.track);
    };

    if(_type==='student')
        makeMediaContainer(_id, myReceivePCs[_id].stream, _name);
    else if(_type==='teacher')
        teacherMedia.srcObject = myReceivePCs[_id].stream
    console.log("#####  다른 사용자 VIDEO 생성");
}


//setTimeout(StudentStrangeDetect,10000)
let timerId = setTimeout(async function tick(){
    // 사진 찍고 학생 이상 감지 탐지 기능 실행하도록 하는 코드 넣기

    // 1. 사진 10장 찍어주는 코드
    await getPic();

    // 2. Rangeframe TEST
    await  getFramePic();

    // 3. Sleep TEST
    await detectSleep();

    timerId = setTimeout(tick, 10000);
},10000);

async function getPic(){
    // 1. 사진 10장 찍어주는 코드
    console.log("GetPic");
    i = 0;

    // 100ms마다 함수 수행하고 id를 이용해 반복 수행 정지시킴
    const intervalId = setInterval(sendPicToServer, 100);
    
    setTimeout( () => {
        clearInterval(intervalId);
        //btnCheckMyself.disabled = false; // 캡쳐 버튼 활성화
    }, 1500);
 }

 async function getFramePic(){
    console.log("Rangeframe TEST");
    socket.emit("getFramePic");
}

async function detectSleep(){
    console.log("Sleep TEST");
    socket.emit("detectSleep");
}

socket.on("receiveAnswer", async (_answer, _id) => {
    try {
        console.log("#####  receive answer 수신");
        await myReceivePCs[_id].pc.setRemoteDescription(_answer);
    } catch (e) {
        console.log(e);
    }
});

socket.on("receiveIce", (_candidate, _id) => {
    console.log("#####  receive candidate 추가");
    myReceivePCs[_id]
        .pc
        .addIceCandidate(_candidate);
});


socket.on("userExit", (_id) => {
    delete myReceivePCs[_id];
    if (document.getElementById(_id)) 
        studentsMediaContainer.removeChild(document.getElementById(_id).parentElement);
    }
);


// student 수 많을 시 좌우 스크롤 버튼 기능
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ 스크롤 기능 좀 더 깔끔하면 좋을 듯

const btnLeftStudent = document.querySelector("#btnLeftStudentContainer");
const btnRightStudent = document.querySelector("#btnRightStudentContainer");

btnLeftStudent.addEventListener("click", (event) =>{
    studentsMediaContainer.scrollBy({top:0, left:-150, behavior:'smooth'});
});


btnRightStudent.addEventListener("click", (event) =>{
    studentsMediaContainer.scrollBy({top:0, left:150, behavior:'smooth'});
});


// ############### 채팅 관련 기능  ################

const tBoxInput = document.querySelector("#inputBox");

// 마지막으로 채팅친 사람의 이름, 닉네임 중복 출력 방지
let lastChattedName;

tBoxInput.addEventListener("keyup", EnterMessage);

function EnterMessage(event) {
    if (event.keyCode == 13) { // 엔터키
        const msg = tBoxInput.value;
        tBoxInput.value = "";
        // 보낼 메시지 없을 경우 수행 x
        if (msg === "") 
            return;
        
        // socket.id 는 사용자 명으로 바꾸면 됨
        socket.emit("sendChat", msg);

        // 내가 보낸 메시지를 내 채팅창에 띄움
        makeMessage(msg, '나', 'me');

        // 메시지 보냈으므로 스크롤 최신화
        messageBox.scrollTo(0, messageBox.scrollHeight);

    }
}

const messageBox = document.querySelector("#messageBox");

// 채팅 메시지를 서버로부터 받은 경우
socket.on("receiveChat", (_msg, _name, _type) => {

    makeMessage(_msg, _name, _type);

    let canScroll = false;
    if (Math.abs(messageBox.scrollTop - (messageBox.scrollHeight - messageBox.clientHeight)) <= 5) {
        canScroll = true;
    }
    if (canScroll) {
        messageBox.scrollTo(0, messageBox.scrollHeight);
    }

});

function makeMessage(_msg, _name, _type){
    const msg_box = document.createElement('div');
    const msg_name = document.createElement('span');
    const msg_content = document.createElement('div');
    if (lastChattedName !== _name) 
        msg_box.appendChild(msg_name);
    
    if(_type==='me'){
        msg_name.id = "chat_name_me";
        msg_content.id = "chat_content_me";
    }else if(_type ==='teacher'){
        msg_name.id = "chat_name_teacher";
        msg_content.id = "chat_content_teacher";
    }
    else{
        msg_name.id = "chat_name_other";
        msg_content.id = "chat_content_other";
    }
    msg_name.innerText = _name;
    lastChattedName = _name;
    msg_content.innerText = _msg;

    msg_name.classList.add("chat_name");
    msg_content.classList.add("chat_content");
    msg_box.appendChild(msg_content);

    messageBox.appendChild(msg_box);
}

// ###############  옵션 관련 기능  ############### 

const btnCamSwitch = document.querySelector("#btnCamSwitch");
const btnMicSwitch = document.querySelector("#btnMicSwitch");
const btnExit = document.querySelector("#btnExit");

socket.on('rangeFrame_result', function (result){
    if(result=='1'){ // 0이면 아무것도 검출 안됨, 
        alert('얼굴이 잘 나옵니다.');
    }
    else if(result=='0'){ 
        alert('얼굴이 나오도록 화면 각도를 조절해주세요.');
    }
  });
  
socket.on('sleep_result', function (result){
    if(result=='0'){ // 0이면 아무것도 검출 안됨, 
        alert('안졸고 있다.');
    }
    else if(result=='1'){ 
        alert('졸고있습니다.');
    }   
    else if(result=='2'){
        alert('얼굴이 보이지 않습니다.');
    }
  });

function sendPicToServer() {
    console.log("sendPicToServer");
    i++;
    const context = canvas.getContext("2d");
    canvas.width = 293;
    canvas.height = 220;

    context.drawImage(me, 0, 0, 293, 220);
  
    // canvas의 image를 dataURL로 변환
    // dataURL로부터 img의 src로 사용 가능
    // dataURL로부터 blob을 만들어 이를 서버로 전송
    var data = canvas.toDataURL("image/png");
    const file = dataURLtoBlob(data);
    console.log("my_name : "+my_name);
    socket.emit("getSleepPic", file, my_name, i);
  }

  function dataURLtoBlob(dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURL.split(",")[1]);
  else byteString = unescape(dataURL.split(",")[1]);
  // 마임타입 추출
  var mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
}

// cam ON / OFF 버튼

btnCamSwitch.addEventListener("click", (event)=>{
    try{
        myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;

        if(myStream.getVideoTracks()[0].enabled)
            btnCamSwitch.innerText = "Cam Off";
        else
            btnCamSwitch.innerText = "Cam On";
    }
    catch(e){
        window.alert("카메라를 찾을 수 없습니다.");
    }
});


// Mic ON / OFF 버튼

btnMicSwitch.addEventListener("click", (event)=>{
    try{
        myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
        if(myStream.getAudioTracks()[0].enabled)
            btnMicSwitch.innerText = "Mic Off";
        else
            btnMicSwitch.innerText = "Mic On";
    }catch(e){
        window.alert("마이크를 찾을 수 없습니다.");
    }
});


// 종료 확인 버튼

btnExit.addEventListener("click", (event)=>{
    if(confirm("종료하시겠습니까?"))
        window.location.href = '/';
});


//  #################################################

socket.on('classClosed', ()=>{
    window.alert('수업이 종료되었습니다 !!!');
    socket.emit('runFunction',2000,GoBack);
});

function GoBack(){
    window.location.href = '/waiting_room';
}