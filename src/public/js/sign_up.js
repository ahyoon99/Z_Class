const socket = io();

const btnGetPic = document.querySelector("#btnGetPic");

btnGetPic.addEventListener("click", GetPic);

const width = 480;
let height = 0;
let streaming = false;
const video = document.querySelector("#selfCamera");
const canvas = document.querySelector("canvas");
const photo = document.querySelector("#pic");

video.addEventListener("canplay", (event)=>{
    if(!streaming){
        height = video.videoHeight / (video.videoWidth/width);
        video.setAttribute('width',width);
        video.setAttribute('height',height);
        canvas.setAttribute('width',width);
        canvas.setAttribute('height',height);
        streaming = true;

    }
});

function Init(){
    navigator.mediaDevices.getUserMedia({video:true, audio:false})
    .then((stream)=>{
        video.srcObject = stream;
        video.play();
        btnGetPic.disabled = false;
    })
    .catch((e)=>{
        console.log(e);
    })

}

Init();

let i;
function GetPic(event){
    event.preventDefault();
    i = 0;
    btnGetPic.disabled=true;
    const intervalId = setInterval(sendPicToServer, 100);
    setTimeout(()=>{clearInterval(intervalId);
        btnGetPic.disabled=false;}, 2500);

}

function sendPicToServer(){
    i++;
        const context = canvas.getContext('2d');
        canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);
    
          var data = canvas.toDataURL('image/png');
          photo.setAttribute('src', data);
          const file = dataURItoBlob(data);
          socket.emit("signUp_getPic", file, i);
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // 마임타입 추출
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
}