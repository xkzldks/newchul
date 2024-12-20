$(document).ready(function () {
    createCheckBox();
    showReview();
    modal = document.querySelector('.modal');
    modalOpen = document.querySelector('.modal_btn');
    modalClose = document.querySelector('.close_btn');
    p_under = document.querySelector('.p_under');
    console.log(p_under);
});

window.onload = function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    setTimeout(function(){
        getChul(String(year+month+day));
    },10);

    $("#checkboxDateC").prop("checked",false);
    $('#title').attr("disabled",true);
}

function mClose(event){
    modal.classList.remove('on');
    document.getElementById('modalName').innerText = '이름 :  ';
    document.getElementById('modalId').innerText = 'ID :  ';
    document.getElementById('modalGender').innerText = '성별 :  ';
    document.getElementById('modalBirthday').innerText = '생일 :  ';
    document.getElementById('modalBirthyear').innerText = '출생년도 :  ';
    console.log(document.getElementsByClassName('close_btn').name, document.getElementById('modalSignificant').value);
    $.ajax({
        type: "POST",
        url: "/modalSignificant",
        data: {id : document.getElementsByClassName('close_btn').name,si:document.getElementById('modalSignificant').value},
        success: function (response) {
            document.getElementById('modalSignificant').value = '';
        }
    })
}
function showReview(){
    $.ajax({
        type: "GET",
        url: "/chul_get",
        data: {},
        success: function (response) {
            db = response['all_check'];
            for (let i = 0; i < db.length; i++){

                let ryear = db[i]['year'];
                let rdate = db[i]['date'];
                let rname = db[i]['name'];
                console.log(rname);
                let count = '남:' + db[i]['male'] + ' 여:'  + db[i]['female'] + '<br>합 : ' + db[i]['hap'];
                let temp_html = "<tr>"+
                                    "<td class = 'tdz zz' style='text-align : center;'>"+ryear+"</td>"+
                                    "<td href = '#' onclick = getChul_pre("+String(ryear)+String(rdate)+") class = 'tdz zz cursor' style='text-align : center; color: olivedrab; text-decoration: underline;'>"+rdate+"</td>"+
                                    "<td class = 'tdz zz' style= 'text-align : center; word-break: keep-all;'>"+rname+"</td>"+
                                    "<td class = 'tdz zz' style='text-align : center;'>"+count+"</td>"+
                                "</tr>";
                $('#chulcheck-box').append(temp_html);
            }
            }
        })
}


function createCheckBox(){
    $.ajax({
          type: "GET",
          url: "/getDB",
          data: {},
          success: function (response) {
              let dbP = response['dbP']
              const dbG = new Set();
              for(let i = 0; i < dbP.length; i++){
                dbG.add(dbP[i]['group']);
              }

              document.getElementById("txtPanelAddCheckbox").innerHTML = "";

              for(const num of dbG){
                var txt = "<div ondragenter='f(event)' ondragleave='l(event)' class = 'column' id ="+num+" style='border ='1px solid rgb(128 189 128)'; flex-wrap: wrap;line-height:20%'><input class = 'h1class' style = 'display : none;' type = 'text' size = '6' value = "+num+"><h1 class ='cid'>"+num+"</h1></div>"
                document.getElementById("txtPanelAddCheckbox").innerHTML += txt;
              }
              for(let n = 0; n < dbP.length; n++){
                 var txt = "<label draggable='true' ><div class='list-group-item'><span tabindex = '0' onfocusin='focusinHandle(this)' onfocusout = 'focusoutHandle(this)' class='handle' id = "+dbP[n]['userid']+ "handle style = 'display : none;'> &#9850;&nbsp;</span><input type = 'checkbox' class = 'check_id' onclick='chul(event)' id =  "+dbP[n]['userid']+" name = '" + dbP[n]['group']+ "'  value = '" + dbP[n]['username'] + "'>  "  + dbP[n]['username'] + "</div></label>";
                 document.getElementById(dbP[n]['group']).innerHTML += txt;
              }
          }

  })
}

function f(event){
    if(event.target.classList[0] == 'column'){
        event.target.style.border ='1px solid red';
    }
}

function l(event){
    if(event.target.classList[0] == 'column'){
        event.target.style.border ='1px solid rgb(128 189 128)';
    }
}

function focusinHandle(event){
    event.parentElement.style.border="1px solid yellow";
}

function focusoutHandle(event){
    event.parentElement.style.border="";
}

function saveGroup(){
    if(confirm("변경사항을 적용하시겠습니까?") == true){
        const columns = document.querySelectorAll(".column");
        var group_fix = "";
        columns.forEach((column) => {
            const a = column.getElementsByClassName('h1class')[0]['value'];
            group_fix += a + " ";

            const labels = column.getElementsByClassName("check_id");

            for(let i = 0; i < labels.length; i++){
                console.log(labels[i]);
                group_fix += labels[i].id + ' ';
            }
            group_fix += '/'
            })
        console.log(group_fix);
        $.ajax({
            type: "POST",
            url: "/groupSave",
            data: {group_fix:group_fix},
            success: function (response) {
                createCheckBox();
                $("input:radio[name='modeSelect']:radio[value='1']").prop('checked', true);
                document.getElementById("groupDiv").style.display = 'none';
//                document.getElementById("groupSave").style.display = 'none';
//                document.getElementById("groupAdd").style.display = 'none';


                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const day = today.getDate().toString().padStart(2, '0');

                setTimeout(function(){
                    getChul(String(year+month+day));
                },10);
                }
            })
        }
}


function handleHidden(){
    document.getElementById("groupDiv").style.display = 'none';
    var matches = document.getElementsByClassName("handle");

    for(var i = 0; i < matches.length; i++){
        matches[i].style.display = 'none';
    }
}

function selectCheck(){
    handleHidden();
    var cids = document.getElementsByClassName("cid");
    for(var i = 0; i < cids.length; i++){
        cids[i].style.display = '';
    }
    var check_id = document.getElementsByClassName("check_id");
    for(var i = 0; i < check_id.length; i++){
        check_id[i].style.display = 'block';
    }
    var check_h1 = document.getElementsByClassName("h1class");
    for(var i = 0; i < check_h1.length; i++){
        check_h1[i].style.display = 'none';
    }

//    const today = new Date();
//    const year = today.getFullYear();
//    const month = (today.getMonth() + 1).toString().padStart(2, '0');
//    const day = today.getDate().toString().padStart(2, '0');
//    getChul(String(year+month+day));
}

function selectInfo(){
    handleHidden();
    var cids = document.getElementsByClassName("cid");
    for(var i = 0; i < cids.length; i++){
        cids[i].style.display = '';
    }
    var check_id = document.getElementsByClassName("check_id");
    for(var i = 0; i < check_id.length; i++){
        check_id[i].style.display = 'block';
    }
    var check_h1 = document.getElementsByClassName("h1class");
    for(var i = 0; i < check_h1.length; i++){
        check_h1[i].style.display = 'none';
    }

}

function selectGroup(){
    grab();
    var cids = document.getElementsByClassName("cid");
    for(var i = 0; i < cids.length; i++){
        cids[i].style.display = 'none';
    }

    var check_h1 = document.getElementsByClassName("h1class");
    for(var i = 0; i < check_h1.length; i++){
        check_h1[i].style.display = 'block';
    }
    document.getElementById("groupDiv").style.display = '';
    var matches = document.getElementsByClassName("handle");
    for(var i = 0; i < matches.length; i++){
        matches[i].style.display = 'block';
    }
    var check_id = document.getElementsByClassName("check_id");
    for(var i = 0; i < check_id.length; i++){
        check_id[i].style.display = 'none';
    }

}

function groupAdd(){
    var txt = "<div class = 'column' style='flex-wrap: wrap;line-height:20%'><input class = 'h1class' display = 'block' type = 'text' size = '6' value = 새그룹><h1 class ='cid' style = 'display : none;'>새 그룹</h1></div>"
    document.getElementById("txtPanelAddCheckbox").innerHTML += txt;
    grab();
}

function grab(){
const columns = document.querySelectorAll(".column");
    columns.forEach((column) => {
      new Sortable(column, {
        group: "shared",
        handle: ".handle",
        animation: 150,
        ghostClass: "blue-background-class"
      });
    })
}

function getCheckboxValue(){
        let c = "input[class='check_id']:checked";
        const s = document.querySelectorAll(c);
        s.forEach((el) => {
            console.log(el['id']);
            result += el['id'] + ' ';
        });
        document.getElementById('result').innerText = result;
        console.log(document.getElementById('result').innerText);
}

function autoSave(){
    if(confirm("메일백업?") == true){
       $.ajax({
        type: "GET",
        url: "/autoSave",
        data: {},
        success: function (response) {
            alert(response['msg']);
            window.location.reload();
        }
       })
    }
}
function getChul_pre(event){
    $(":checkbox").prop("checked",false);
    $("#checkboxDateC").prop("checked",true);
    $('#title').attr("disabled",false);
    document.getElementById("txtPanelAddCheckbox").innerHTML = ''
    $("input:radio[name='modeSelect']:radio[value='1']").prop('checked', true);
    createCheckBox();
    setTimeout(function(){
        getChul(event);
    },100);
}
function getChul(event){
    err = '';
    errV = 0;
    $.ajax({
          type: "POST",
          url: "/autoCheck",
          data: {sdate:event},
          success: function (response) {
          $('.check_id').prop("checked",false);
              if (response['result'] != undefined){
                  let name = response['result'][0]['userid'].split(' ');
                  for(let i = 0; i < name.length; i++){
                        try{
                            document.getElementById(name[i]).checked = true;
                        }catch(e){
                            err += name[i] + ' ';
                            errV += 1;
                        }
                      }
                  $('#title').val(response['result'][0]['date']);
                  console.log('##명단불러오기##\n '+ err + errV +'명 제외\n ' + (name.length - errV) + '명 불러오기 성공!');
              }
              else{
                console.log(response['msg']);
              }

          }

  })
}

function focusinHandler(event){
    event.target.parentElement.style.border="1px solid red";
    document.getElementById("txtPanelAddCheckbox").innerHTML = "날짜 조회 중...";
    p_under.classList.add('on');
    modeDiv = document.getElementById('modeDiv');
    modeDiv.style.visibility = 'hidden';
}

function focusoutHandler(event){
    const check_month = {'01': '31', '02': '29', '03': '31', '04': '30', '05': '31', '06': '30', '07': '31', '08': '31', '09': '30', '10': '31', '11': '30', '12': '31'};
    var test1 = document.getElementById('title');
    console.log(test1.value + ' ' + test1.value.substr(0, 2) + ' ' + test1.value.substr(2, 4));
    console.log(parseInt(check_month[String(test1.value.substr(0, 2))]), parseInt(test1.value.substr(2, 4)), 1);
    if((String(test1.value).length == 4) && (parseInt(check_month[String(test1.value.substr(0, 2))]) >= parseInt(test1.value.substr(2, 4))) && (parseInt(test1.value.substr(2, 4)) >= 1)){
        p_under.classList.remove('on');
        modeDiv.style.visibility = 'visible';
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        event.target.parentElement.style.border = "";

        createCheckBox();

        if((test1.value == String(month + day))){
            $("#checkboxDateC").prop("checked",false);
            $('#title').attr("disabled",true);
        }
        else{
            $(":checkbox").prop("checked",false);
            $("#checkboxDateC").prop("checked",true);
            $('#title').attr("disabled",false);
        }
        setTimeout(function(){
            getChul(String(year+test1.value));
        },100);
        var v = $("input[type=radio][name=modeSelect]:checked").val()
        if(v == '1'){
            document.getElementById("selectCheck").click();
        }
        else if(v == '2'){
            setTimeout(function(){
                document.getElementById("selectGroup").click();
            },100);

        }
        else{
            document.getElementById("selectInfo").click();
        }
    }
    else if(String(test1.value).length == 0){
        document.getElementById("title").focus();
    }
    else{
        document.getElementById("title").focus();
    }

}
//try{
//        document.getElementById(name[i]).checked = true;
//    }catch(e){
//        err += name[i] + ' ';
//        errV += 1;
//    }



function chul(event)  {
    var test1 = document.getElementById('selectCheck');
    if($(test1).is(":checked") == false){
        if(document.getElementById(event.target.id).checked == true){
            document.getElementById(event.target.id).checked = false;
        }
        else{
            document.getElementById(event.target.id).checked = true
        }
        var test3 = document.getElementById('selectInfo');
        if($(test3).is(":checked") == true){
            modal.classList.add('on');
            $.ajax({
            type: "POST",
            url: "/modalInfo",
            data: {id:event.target.id},
            success: function (response) {
                console.log(response['info'][0]);
                const modal_name = response['info'][0]['username'];
                const modal_id = response['info'][0]['userid'];
                const modal_gender = response['info'][0]['gender'];
                const modal_birthyear = response['info'][0]['birthyear'];
                const modal_birthday = response['info'][0]['birthday'];
                const modal_significant = response['info'][0]['significant'];

                document.getElementById('modalName').innerText += modal_name;
                document.getElementById('modalId').innerText += modal_id;
                document.getElementById('modalGender').innerText += modal_gender;
                document.getElementById('modalBirthday').innerText += modal_birthday;
                document.getElementById('modalBirthyear').innerText += modal_birthyear;
                document.getElementById('modalSignificant').value += modal_significant;
                document.getElementsByClassName('close_btn').name = modal_id;
                console.log(document.getElementsByClassName('close_btn'));
            }
           })


        }
    }
    else{
        var test2 = document.getElementById('checkboxDateC');
        if($(test2).is(":checked") == true){
            sendDate = $('#title').val();
        }
        else{
            sendDate = 'today';
        }
        const $table = document.getElementById('chulcheck-box');
        $table.innerText = '';
        $.ajax({
            type: "POST",
            url: "/oneModi",
            data: {date:sendDate,id:event.target.id},
            success: function (response) {
                setTimeout(function(){
                    showReview();
                },10);
            }
           })
        }

}
function checkboxDateS(){
    var test1 = document.getElementById('checkboxDateC');

    document.getElementById("selectCheck").click();
    if($(test1).is(":checked") == true){
        $("#title").attr("disabled", false);
    }
    else{
        $("#title").attr("disabled", true);
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        $("#title").val(String(month+day));
        createCheckBox();
        getChul(String(year+month+day));
        document.getElementById('i_date').style.border = "";
    }
}


function copyChul(){
    const today = new Date();
    const year = today.getFullYear();
    $cdate = $('#title').val();
    $.ajax({
            type: "POST",
            url: "/copyChul",
            data: {year: year, date:$cdate},
            success: function (response) {
                var targetText = response['msg'];

                var tempElement = document.createElement("textarea");
                document.body.appendChild(tempElement);
                tempElement.value = targetText;
                tempElement.select();
                document.execCommand('copy');
                document.body.removeChild(tempElement);

                alert(year+$cdate+ " 출석 복사완료");
            }
   })
}

