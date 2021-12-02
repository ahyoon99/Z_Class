const student_input_container = document.querySelector('#student_input');
const input_container = document.querySelector('#sign_up_input_container');
const student_container = document.querySelector('#student_container');
const input_phone_number = document.querySelector("#phone_number");

const btn_back = document.querySelector('#btn_back');
const btn_submit = document.querySelector('#btn_submit');

const radios_job = document.querySelectorAll('input[name="job"]');
radios_job.forEach((radio)=>{
    radio.addEventListener('click', (event)=>{
        jobChanged(radio.value);
    })
});

function jobChanged(_job){
    input_container.classList.remove('invisible');
    if(_job==='teacher'){
        student_container.classList.add('none_display');
        input_phone_number.setAttribute('placeholder', '휴대폰 번호');
    }
    else if(_job==='student'){
        student_container.classList.remove('none_display');
        input_phone_number.setAttribute('placeholder', '부모님 휴대폰 번호');
    }
}




// #####  아이디 양식 작성 후   #####
let step = 0;

const btn_next = document.querySelector('#btn_next');
const video_container = document.querySelector('#video_container');
btn_next.addEventListener('click', (event)=>{
    if(step===0){
    // input 검증
    const form_sign_up = document.querySelector('#form_sign_up');
    console.log(form_sign_up.id.value);
    console.log(form_sign_up.password);
    if(!form_sign_up.job.value||!form_sign_up.id.value||!form_sign_up.password.value||!form_sign_up.name.value||!form_sign_up.phone_number.value||!form_sign_up.affiliation.value)
        return alert('입력되지 않은 항목이 존재합니다 !');
    if(form_sign_up.job.value==='student'&&!form_sign_up.grade.value)
        return alert('입력되지 않은 항목이 존재합니다 !');

    if(form_sign_up.job.value==='teacher'){
        form_sign_up.submit();
    }
    else if(form_sign_up.job.value==='student'){
        // 회원가입 양식 모두 작성 완료했을 경우, 사진촬영 항목 보여짐
        btn_next.disabled = true;
        video_container.classList.remove('none_display');
        form_sign_up.classList.add('none_display');
        InitializeMedia();
        step++;

    }
    }else if(step===1){
        GetPicture();
    }
});

// #####  사용자 촬영 관련  #####
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
    btn_next.disabled = false;
});

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

// # 사진 촬영 #
let i=0;
const socket = io();
function GetPicture(){
    i=0;
    btn_next.disabled = true;

      // 100ms마다 함수 수행하고 id를 이용해 반복 수행 정지시킴
  const intervalId = setInterval(sendPicToServer, 100);
  setTimeout(() => {
    clearInterval(intervalId);
    form_sign_up.submit();
  }, 5000);
}

function sendPicToServer() {
    i++;
    const context = canvas.getContext("2d");
    canvas.width = vid_width;
    canvas.height = vid_width;
    context.drawImage(vid_self, 0, 0, vid_width, vid_height);

    // canvas의 image를 dataURL로 변환 dataURL로부터 img의 src로 사용 가능 dataURL로부터 blob을 만들어 이를
    // 서버로 전송
    var data = canvas.toDataURL("image/png");
    const file = dataURLtoBlob(data);
    socket.emit("signUp_getPicture", file, form_sign_up.id.value, i);
}
function dataURLtoBlob(dataURL) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURL.split(",")[0].indexOf("base64") >= 0) 
        byteString = atob(dataURL.split(",")[1]);
    else 
        byteString = unescape(dataURL.split(",")[1]);
    
    // 마임타입 추출
    var mimeString = dataURL
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}
