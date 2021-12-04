const socket = io();

const btn_back = document.querySelector('#btn_back');
const btn_next = document.querySelector('#btn_next');

let step = 0;

// #####  회원 가입 과정  ######
// # 1단계 : 회원 유형 선택 #
const form_sign_up = document.querySelector('#form_sign_up');
const input_container = document.querySelector('#sign_up_input_container');
const job_container = document.querySelector('#job_container');
const radios_job = document.querySelectorAll('input[name="job"]');

// 선택한 유형에 따라 회원가입 양식 보여줌
radios_job.forEach((radio)=>{
    radio.addEventListener('click', (event)=>{
        jobSelected(radio.value);
    })
});

function jobSelected(_job){
    if(_job==='teacher'){
        form_sign_up.phone_number.setAttribute('placeholder', '휴대폰 번호');
        form_sign_up.grade.classList.add('display_none');
    }
    else if(_job==='student'){
        form_sign_up.phone_number.setAttribute('placeholder', '부모님 휴대폰 번호');
        form_sign_up.grade.classList.remove('display_none');
    }
    job_container.classList.add('display_none');
    input_container.classList.remove('display_none');
    btn_next.disabled = false;
}


// #####  2단계 : 회원 가입 양식 작성   #####

// # 아이디 중복 체크 #
let is_available_id=false;
const btn_check_duplicated = document.querySelector('#btn_check_duplicated');

// id 값 바꿨을 경우에는 중복체크 초기화
form_sign_up.id.addEventListener('change',()=>{
    is_available_id=false;
    btn_check_duplicated.classList.add('btn_wrong');
});

// 중복 체크 버튼 누른 경우 id를 서버로 보내 사용가능여부 판별
btn_check_duplicated.addEventListener('click',()=>{
    if(!form_sign_up.id.value){
        return alert('아이디를 입력해 주세요 !');
    }
    socket.emit('checkAvailableId',form_sign_up.id.value);
});

// 서버로부터 사용가능여부가 판별되어 bool값으로 전달됨
socket.on('checkAvailableId', (_bool)=>{
    is_available_id=_bool;
    if(is_available_id){
        form_sign_up.id.setCustomValidity('');
        btn_check_duplicated.classList.remove('btn_wrong');
        alert('사용 가능한 아이디입니다 !');
    }
    else{
        form_sign_up.id.setCustomValidity('이미 존재하는 아이디');
        alert('이미 존재하는 아이디입니다 !');
    }
});

// # 회원 가입 양식 작성 완료 #
// 확인 버튼을 눌렀을 시, 중복 체크 하였는지, 모든 양식 작성했는지를 확인 후 다음 단계 진행
const video_container = document.querySelector('#video_container');
btn_next.addEventListener('click', (event)=>{
    // input 검증
    if(!form_sign_up.job.value||!form_sign_up.id.value||!form_sign_up.password.value||!form_sign_up.name.value||!form_sign_up.phone_number.value||!form_sign_up.affiliation.value)
        return alert('입력되지 않은 항목이 존재합니다 !');
    if(form_sign_up.job.value==='student'&&!form_sign_up.grade.value)
        return alert('입력되지 않은 항목이 존재합니다 !');
    if(!is_available_id)
        return alert('아이디 중복확인을 해주세요 !');

    //btn_next.disabled = true;
    step++;

    if(form_sign_up.job.value==='teacher')
        form_sign_up.submit();
    else if(form_sign_up.job.value==='student'){
        if(step===1){   // 회원가입 양식 모두 작성 완료했을 경우, 사진촬영 항목 보여짐
            video_container.classList.remove('display_none');
            form_sign_up.classList.add('display_none');
            InitializeMedia();
        }
        else{           // 사진 촬영 시작 시
            CheckReadyToTakePicture();
        }
    }
});

// #####  3단계 : 학생 사진 촬영 후 train  #####

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

// # 사용자 마스크 / 모자 착용 여부 체크 #
const progress_bar = document.querySelector('#progress_bar');
const progress_text = document.querySelector('#progress_text');
const context = canvas.getContext("2d");
function CheckReadyToTakePicture(){
    context.drawImage(vid_self, 0, 0, vid_width, vid_height);

    // canvas의 image를 dataURL로 변환 dataURL로부터 img의 src로 사용 가능 dataURL로부터 blob을 만들어 이를
    const data = canvas.toDataURL("image/png");
    const file = dataURLtoBlob(data);
    progress_text.innerText = '30%';
    progress_bar.style.width = 30+'%';
    socket.emit("signUp_checkReady", file, form_sign_up.id.value);
}
socket.on('signUp_checkReady', (_result)=>{
    switch(_result){
        case -1:
            progress_text.innerText = '0%';
            progress_bar.style.width = 0;
            return alert('에러 발생, 다시 시도해 주세요 !');
        break;
        case 1:
            progress_text.innerText = '0%';
            progress_bar.style.width = 0;
            return alert('모자를 벗고 다시 시도해주세요 !');
        break;
        case 2:
            progress_text.innerText = '0%';
            progress_bar.style.width = 0;
            return alert('마스크를 벗고 다시 시도해주세요 !');
        break;
        case 3:
            progress_text.innerText = '0%';
            progress_bar.style.width = 0;
            return alert('모자와 마스크를 벗고 다시 시도해주세요 !');
        break;
    }
    btn_next.disabled = true;
    let i=0;
    let progress = 51;
    const intervalId = setInterval(function(){
        context.drawImage(vid_self, 0, 0, vid_width, vid_height);
        const data = canvas.toDataURL("image/png");
        const file = dataURLtoBlob(data);
            progress_text.innerText = progress + '%';
            progress_bar.style.width = progress+'%';
        socket.emit("signUp_getPicture", file, form_sign_up.id.value, i);
        progress++;
        i++;
    }, 100);
    setTimeout(() => {
      clearInterval(intervalId);    
      socket.emit('signUp_finish');
      form_sign_up.submit();
    }, 5000);
});



// # 사진 촬영 #
let i=0;
function GetPicture(){
    i=0;
    btn_next.disabled = true;

      // 100ms마다 함수 수행하고 id를 이용해 반복 수행 정지시킴
  const intervalId = setInterval(sendPicToServer, 100);
  setTimeout(() => {
    clearInterval(intervalId);    
    socket.emit('send_finish');
    form_sign_up.submit();
  }, 5000);
}

function sendPicToServer() {
    context.drawImage(vid_self, 0, 0, vid_width, vid_height);

    // canvas의 image를 dataURL로 변환 dataURL로부터 img의 src로 사용 가능 dataURL로부터 blob을 만들어 이를
    // 서버로 전송
    const data = canvas.toDataURL("image/png");
    const file = dataURLtoBlob(data);
    socket.emit("signUp_getPicture", file, form_sign_up.id.value, i);
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
