const btn_sign_up = document.querySelector('#btn_sign_up');
btn_sign_up.addEventListener('click', (event)=>{
    event.preventDefault();
    window.location.href = '/user/sign_up';
})