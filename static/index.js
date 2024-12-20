$(document).ready(function (){
    const today = new Date();
    year = today.getFullYear();
    month = (today.getMonth() + 1).toString().padStart(2, '0');
    day = today.getDate().toString().padStart(2, '0');

    $nowYear = document.getElementById('nowYear');
    $nowMonth = document.getElementById('nowMonth');
    $nowDate = document.getElementById('nowDate');
    $now_Date = document.getElementById('now_Date');

    $nowYear.innerText = year;
    $nowMonth.innerText = month;
    $nowDate.innerText = day;

    document.querySelectorAll('button').forEach(button => button.innerHTML = '<div><span>' + button.textContent.trim().split('').join('</span><span>') + '</span></div>');
});

function getlist(){
//    console.log($nowYear.innerText, $nowMonth.innerText, $nowDate.innerText);
$.ajax({
        type: "GET",
        url: "/access",
        data: {},
        success: function (response) {
            lix = response['x'];  //비회원
            li0 = response['0'];  //회원
            li1 = response['1'];  //관리자

            $boxx = document.getElementById('x-box');
            $box0 = document.getElementById('0-box');
            $box1 = document.getElementById('1-box');

            $boxx.innerText = '';
            $box0.innerText = '';
            $box1.innerText = '';

            for (let i = 0; i < lix.length; i++){
                let username = lix[i]['username'];
                let userid = lix[i]['userid'];
                let gender = lix[i]['gender'];
                let temp_html = "<tr>"+
                                    "<td class = 'tdz' style='text-align : center;'>"+username+"</td>"+
                                    "<td class = 'tdz' style='text-align : center; color: olivedrab; text-decoration: underline;'>"+userid+"</td>"+
                                    "<td class = 'tdz' style= 'text-align : center; word-break: keep-all;'>"+gender+"</td>"+
                                    "<td name = "+username+" href= # id = "+userid+" class = 'tdz cursor' onclick =accessGuest(this) style='background : content-box; background-color : #fd9f9f4a;text-align : center; color: red; text-decoration: underline;'>회원 승인</td>"+
                                    "<td name = "+username+" href = # id = '"+userid+"'  class = 'tdz cursor' onclick = delUser(this) style = 'content-box; background-color : red;'>삭제</td>"+
                                "</tr>"
                $('#x-box').append(temp_html);
            }
            for (let i = 0; i < li0.length; i++){
                let username = li0[i]['username'];
                let userid = li0[i]['userid'];
                let gender = li0[i]['gender'];
                let temp_html = "<tr>"+
                                    "<td class = 'tdz' style='text-align : center;'>"+username+"</td>"+
                                    "<td class = 'tdz' style='text-align : center; color: olivedrab; text-decoration: underline;'>"+userid+"</td>"+
                                    "<td class = 'tdz' style= 'text-align : center; word-break: keep-all;'>"+gender+"</td>"+
                                    "<td name = "+username+" href= # id = "+userid+" class = 'tdz cursor' onclick =accessMaster(this) style='background : content-box; background-color : #80bdac2e;text-align : center; color: blue; text-decoration: underline;'>권한 양도</td>"+
                                    "<td name = "+username+" href = # id = '"+userid+"' class = 'tdz cursor' onclick = delUser(this) style = 'content-box; background-color : red;'>삭제</td>"+
                                "</tr>"
                $('#0-box').append(temp_html);
            }
            for (let i = 0; i < li1.length; i++){
                let username = li1[i]['username'];
                let userid = li1[i]['userid'];
                let gender = li1[i]['gender'];
                let temp_html = "<tr>"+
                                    "<td class = 'tdz' style='text-align : center;'>"+username+"</td>"+
                                    "<td class = 'tdz' style='text-align : center; color: olivedrab; text-decoration: underline;'>"+userid+"</td>"+
                                    "<td class = 'tdz' style= 'text-align : center; word-break: keep-all;'>"+gender+"</td>"+
                                    "<td name = "+username+" id = "+userid+" class = 'tdz' style='background : content-box; background-color : #80bdac2e;text-align : center; color: blue; text-decoration: underline;'>* 관리자 *</td>"+
//                                    "<td name = "+username+" href = # id = '"+userid+"' class = 'tdz cursor' onclick = delUser(this) style = 'content-box; background-color : red;'>삭제</td>"+
                                "</tr>"
                $('#1-box').append(temp_html);
            }
        }
    })
}
function accessGuest(id){
    if(confirm($(id).attr('name') + "님에게 회원 권한을 부여하시겠습니까?") == true){
        id = $(id).attr('id');
        $.ajax({
            type: "POST",
            url: "/accessGuest",
            data: {id:id},
            success: function (response) {
                getlist();
            }
        })
    }
}
function accessMaster(id){
    if(confirm($(id).attr('name') + "님에게 관리자권한을 양도하시겠습니까?") == true){
        id = $(id).attr('id');
        $.ajax({
            type: "POST",
            url: "/accessMaster",
            data: {id:id},
            success: function (response) {
                alert("관리자 권한양도 완료\n수고하셨습니다.");
                window.location.reload();
            }
         })
     }
}

function delUser(event){
    if(confirm($(event).attr('name') + "님을 명단에서 삭제하시겠습니까?\nid : " + $(event).attr('id')) == true){
    id = $(event).attr('id')
    $.ajax({
            type: "POST",
            url: "/accessDel",
            data: {id:id},
            success: function (response) {
                console.log($(event).attr('name'), '삭제');
                getlist();
            }
         })

    }
}

function userAttendance(){
    $nowYear = document.getElementById('nowYear');
    $nowMonth = document.getElementById('nowMonth');
    $nowDate = document.getElementById('nowDate');
    console.log($nowYear);
    year = $nowYear.innerText;
    month = $nowMonth.innerText;
    day = $nowDate.innerText;

    console.log(year, month, day);
    $.ajax({
            type: "POST",
            url: "/userAttendance",
            data: {year : year, month : month, day : day},
            success: function (response) {
                    attendance = response['li'];
                    dr = response['dr'];
                    wn = response['wn'];
                    $dr_start = document.getElementById('dr_start');
                    $dr_end = document.getElementById('dr_end');

                    $dr_start.innerText = dr[0];
                    $dr_end.innerText = dr[1];
                    document.getElementById('rangeYear').innerText = String(dr[1]).substring(0, 4)+'년'
                    d = '~ <p class = "date_stand" style = " text-decoration: underline; display:inline;"><mark>'+ String(year+month+day) + '</mark></p> ~ '
                    $now_Date.innerHTML += d;

                    $userGraph = document.getElementById('userGraph');
                    $userGraph.innerHTML  = '<div style = "text-align:center;">'+wn+'주동안 총 '+ attendance.length+"번 출석<br>출석률 : "+ (attendance.length/wn*100).toFixed(2)+"%</div>\n"
                    for(let i = 0; i <attendance. length; i++){
                        $userGraph.innerHTML += attendance[i] + '\n';
                    }

            }
    })
}

function ex_dr(){
    $nowYear = document.getElementById('nowYear');

    year = $nowYear.innerText;

    $date_stand = document.getElementsByClassName('date_stand')[0];
    $date_stand.id = parseInt($date_stand.id) - 1;
    console.log($date_stand.id);

    $dr_start = document.getElementById('dr_start');
    $dr_end = document.getElementById('dr_end');

    $dr_start.innerText = parseInt($dr_start.innerText.substring(0, 4)) - 1;
    $dr_end.innerText = parseInt($dr_end.innerText.substring(0, 4)) -1;

    $date_stand.innerHTML = '<mark>'+String(parseInt($date_stand.id)) + '</mark>'

}

function fu_dr(){
    $nowYear = document.getElementById('nowYear');

    year = $nowYear.innerText;

    $date_stand = document.getElementsByClassName('date_stand')[0];
    $date_stand.id = parseInt($date_stand.id) + 1;
    console.log($date_stand.id);

    $dr_start = document.getElementById('dr_start');
    $dr_end = document.getElementById('dr_end');

    $dr_start.innerText = parseInt($dr_start.innerText.substring(0, 4)) + 1;
    $dr_end.innerText = parseInt($dr_end.innerText.substring(0, 4)) + 1;

    $date_stand.innerHTML = '<mark>'+String(parseInt($date_stand.id)) + '</mark>'

}