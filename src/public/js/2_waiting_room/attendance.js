const tbody = document.querySelector('tbody');
const input_date = document.querySelector('input[type="date"]');
const now = new Date();

input_date.addEventListener('change',()=>{
    GetAttendance(input_date.value);
})
const today = now.getFullYear().toString()+'-'+(now.getMonth()+1).toString()+'-'+now.getDate().toString();
input_date.value = today;
GetAttendance(today);






function GetAttendance(_day){
    const day = _day.replace(/\-/g,'');

    const data = attendances[day];
    tbody.innerHTML="";
    if(!data){
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        tr.appendChild(td);
        td.innerText = '출석부 정보 없음';
        td.colSpan=2;
        tbody.appendChild(tr);
        return;
    }
    let attendance = {};
    for(let i in data){
        const tr = document.createElement('tr');
        const td_name = document.createElement('td');
        const td_state = document.createElement('td');
        tr.appendChild(td_name);
        tr.appendChild(td_state);
        td_name.innerText = name_info[i];
        td_state.innerText = data[i];
        tbody.appendChild(tr);
    }
}