const alert_container = document.querySelector('#alert_container');
const span_alert = document.querySelector('#span_alert');
const btn_alert = document.querySelector('#btn_alert');

function Alert(msg){
    alert_container.classList.remove('display_none');
    span_alert.innerText = msg;
}