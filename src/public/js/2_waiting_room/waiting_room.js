const msg_hi = document.querySelector('#msg_hi');
const msg_ori = msg_hi.innerText;
const msg_emoji = ['😊', '😁'];
let i = 0;
setInterval(()=>{
    msg_hi.innerText =  msg_emoji[i] +msg_ori;
    i = (i+1)%2;
},500);