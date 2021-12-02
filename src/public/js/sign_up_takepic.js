const socket = io();

const btnGetPic = document.querySelector("#btnGetPic");
const btnCheckMyself = document.querySelector("#btnCheckMyself");

btnGetPic.addEventListener("click", GetPic);
btnCheckMyself.addEventListener("click", CheckMyself);

// 캡쳐할 사진의 width, height
// width를 정해주면 client의 video의 비율을 이용해 height 계산됨
const width = 480;
let height = 0;
let streaming = false;
const video = document.querySelector("#selfCamera");
const canvas = document.querySelector("canvas");
const photo = document.querySelector("#pic");

// video가 play 가능한 상태가 되면 실행됨
video.addEventListener("canplay", (event) => {
  if (!streaming) {
    // video의 비율을 이용해 width로부터 height 구함
    height = video.videoHeight / (video.videoWidth / width);
    video.setAttribute("width", width);
    video.setAttribute("height", height);
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    streaming = true; // 이후에 또 실행되는 것 방지
  }
});

function Init() {
  // 사용자의 video를 받고 캡처 버튼 활성화
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
      btnGetPic.disabled = true;  // 캡쳐 버튼 비활성화
      btnCheckMyself.disabled = false;  // yolo test 버튼 비활성화
    })
    .catch((e) => {
      console.log(e);
    });
}

Init();

let i;  // 캡쳐된 파일 넘버링을 위해 사용

// 캡쳐 버튼 누를 시, 사용자 video를 캡쳐
function GetPic(event) {
  event.preventDefault();
  i = 0;
  //btnGetPic.disabled = true; // 캡쳐 버튼 비활성화

  // 100ms마다 함수 수행하고 id를 이용해 반복 수행 정지시킴
  const intervalId = setInterval(sendPicToServer, 100);
  setTimeout(() => {
    clearInterval(intervalId);
    btnGetPic.disabled = false; // 캡쳐 버튼 활성화
  }, 20000);
}

function CheckMyself(event) {
  event.preventDefault();
  i = 0;
  sendYOLOPicToServer();
}

function sendPicToServer() {
  i++;
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  // canvas의 image를 dataURL로 변환
  // dataURL로부터 img의 src로 사용 가능
  // dataURL로부터 blob을 만들어 이를 서버로 전송
  var data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
  const file = dataURLtoBlob(data);
  socket.emit("signUp_getPic", file, i);
}

function sendYOLOPicToServer() {
  i++;
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  // canvas의 image를 dataURL로 변환
  // dataURL로부터 img의 src로 사용 가능
  // dataURL로부터 blob을 만들어 이를 서버로 전송
  var data = canvas.toDataURL("image/png");
  //photo.setAttribute("src", data); ??
  const file = dataURLtoBlob(data);
  socket.emit("signUp_getYOLOPic", file, i);
}

socket.on('yolo_result', function (result){
  if(result=='0'){ // 0이면 아무것도 검출 안됨, 
    btnCheckMyself.disabled = true; // 캡쳐 버튼 비활성화 
    btnGetPic.disabled = false;  // 캡쳐 버튼 활성화
    alert('사진 찍을 준비 완료!');
  }
  else if(result=='1'){    // 1이면 모자만 검출됨, 
    btnCheckMyself.disabled = false; // 캡쳐 버튼 활성화 
    btnGetPic.disabled = true;  // 캡쳐 버튼 비활성화
    alert('모자를 벗어주세요.');
  }
  else if(result=='2'){    // 2이면 마스크만 검출됨,
    btnCheckMyself.disabled = false; // 캡쳐 버튼 활성화 
    btnGetPic.disabled = true;  // 캡쳐 버튼 비활성화
    alert('마스크를 벗어주세요.');
  }
  else if(result=='3'){    // 3이면 모자와 마스크 모두 검출됨
    btnCheckMyself.disabled = false; // 캡쳐 버튼 활성화 
    btnGetPic.disabled = true;  // 캡쳐 버튼 비활성화
    alert('모자와 마스크를 벗어주세요.');
  }
});

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
