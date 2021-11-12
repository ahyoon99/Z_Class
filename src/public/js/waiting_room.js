const btn_logout = document.querySelector('#btn_logout');

btn_logout.addEventListener('click',(event)=>{
    event.preventDefault();
    window.location.href = '/user/logout';
});