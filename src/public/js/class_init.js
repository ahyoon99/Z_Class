const socket = io();

const btn_enter_class = document.querySelector("#btn_enter_class");
const btn_face_test = document.querySelector("#btn_face_test");
btn_enter_class.addEventListener("click", GetPic);

// 캡쳐할 사진의 width, height
// width를 정해주면 client의 video의 비율을 이용해 height 계산됨
const width = 480;
let height = 0;
let streaming = false;
const video = document.querySelector("#vid_self");
const canvas = document.querySelector("canvas");

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
      btnGetPic.disabled = false;
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
  btn_enter_class.disabled = true; // 캡쳐 버튼 비활성화

  sendPicToServer();
  socket.emit("face_detect");
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
  const file = dataURLtoBlob(data);
  socket.emit("signIn_getPic", file, i);
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
