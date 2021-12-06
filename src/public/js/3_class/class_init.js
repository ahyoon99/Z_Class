const socket = io();

const vid_self = document.querySelector('#vid_self');
const canvas = document.querySelector('canvas');


const vid_width = 480;
let vid_height = 0;
vid_self.addEventListener('canplay', (event)=>{
    vid_height = vid_self.videoHeight / (vid_self.videoWidth / vid_width);
    vid_self.setAttribute('width', vid_width);
    vid_self.setAttribute('height', vid_height);
    canvas.setAttribute('width', vid_width);
    canvas.setAttribute('height',vid_height);  
});

InitializeMedia();
function InitializeMedia(){
  navigator.mediaDevices.getUserMedia({video:true,audio:false})
                          .then((stream)=>{
                              vid_self.srcObject = stream;
                              vid_self.play();
                          })
                          .catch((e)=>{
                              alert('사용자의 미디어를 찾을 수 없습니다 !');
                          });
  }
  




function dataURLtoBlob(dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURL.split(",")[0].indexOf("base64") >= 0) 
      byteString = atob(dataURL.split(",")[1]);
  else 
      byteString = unescape(dataURL.split(",")[1]);
  
  // 마임타입 추출
  let mimeString = dataURL
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];
  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type: mimeString});
}




const context = canvas.getContext("2d");
const btn_enter_class = document.querySelector("#btn_enter_class");
  btn_enter_class.addEventListener('click', (event)=>{
  btn_enter_class.disabled = true;
  context.drawImage(vid_self, 0, 0, vid_width, vid_height);
  // canvas의 image를 dataURL로 변환 dataURL로부터 img의 src로 사용 가능 dataURL로부터 blob을 만들어 이를
  const data = canvas.toDataURL("image/png");
  const file = dataURLtoBlob(data);

  socket.emit("checkAttendance", file);
});


socket.on('checkAttendance', (_result)=>{
    btn_enter_class.disabled = false;
    switch(_result){
        case -1:
            return alert('에러 발생, 다시 시도해 주세요 !');
        break;
        case 1:
            return alert('모자를 벗고 다시 시도해주세요 !');
        break;
        case 2:
            return alert('마스크를 벗고 다시 시도해주세요 !');
        break;
        case 3:
            return alert('모자와 마스크를 벗고 다시 시도해주세요 !');
        break;
        case -10:
            return alert('가입된 정보와 일치하지 않는 사용자로 확인됩니다 !');
            break;
         case -100:
            return alert('얼굴인식에 실패하였습니다 !');
            break;
        case 10:
            alert('출석 체크 완료 !');
            return window.location.href = '/class';
            break;
    }
});