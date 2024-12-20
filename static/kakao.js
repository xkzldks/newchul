$(document).ready(function () {

    $.ajax({
            type: "POST",
            url: "/secret",
            data: {},
            success: function (response) {
                let api = response['api'];
                window.Kakao.init(api);
            }
        })
    });

function requestUserInfo() {
    Kakao.API.request({
      url: '/v2/user/me',
    })
      .then(function(res) {
        alert(JSON.stringify(res));
      })
      .catch(function(err) {
        alert(
          'failed to request user information: ' + JSON.stringify(err)
        );
      });
  }
function sendFormat(event){
    $.ajax({
            type: "POST",
            url: "/account/sendFormat",
            data: {i:event},
            success: function (response) {
                console.log("sendFormat", event);
            }
        })
}
function emailRegister(){
    var i = 'email';
    sendFormat(i)
    const currentDate = new Date();
    document.getElementById('birth_year').max = currentDate.getFullYear() - 18;
    document.getElementById('birth_year').value = currentDate.getFullYear() - 18;

    document.getElementById("kakaoBtn").style.display = "none";
    document.getElementById("emailBtn").style.display = "none";
    document.getElementById("ps").style.display = "none";
    document.getElementById("regiBtn").style.display = "";

    document.getElementById("input_id").innerText = "mail";
    document.getElementById("kakaoInfo").style.display = "flex";
    document.getElementById("name").focus();
}

function kakaoRegister(){
    var i = 'kakao';
    sendFormat(i);
    const currentDate = new Date();
    console.log(document.getElementById('regi_format'));
    document.getElementById('birth_year').max = currentDate.getFullYear() - 18;
    document.getElementById('birth_year').value = currentDate.getFullYear() - 18;
    window.Kakao.Auth.login({
        scope: 'profile_nickname, gender, account_email, birthday', //동의항목 페이지에 있는 개인정보 보호 테이블의 활성화된 ID값을 넣습니다.
        success: function(response) {
            window.Kakao.API.request({ // 사용자 정보 가져오기
                url: '/v2/user/me',
                success: (res) => {
                    document.getElementById("kakaoBtn").style.display = "none";
                    document.getElementById("emailBtn").style.display = "none";
                    document.getElementById("ps").style.display = "none";
                    document.getElementById("regiBtn").style.display = "";
                    const kakao_account = res.kakao_account;
                    var username = kakao_account['profile']['nickname'];
                    var gender = kakao_account['gender'];
                    var birthday = kakao_account['birthday'];
                    var email = kakao_account['email'];
                    var user_modi =  document.getElementsByClassName("user_modi");
                    for(var i = 0; i < user_modi.length; i++){
                        console.log(user_modi[i]);
                        user_modi[i].style.background = 'gainsboro';
                        user_modi[i].style.opacity = '70%';
                        user_modi[i].style.border = 'hidden';
                    }
                    document.getElementById("kakaoInfo").style.display = "flex";
                    document.getElementById("birth").readOnly = true;
                    document.getElementById("mail").readOnly = true;
                    document.getElementById("name").value = username;

                    $("input[type=radio][name=gender][id="+gender+"]").prop("checked",true);

                    document.getElementById("birth").value = birthday;
                    document.getElementById("mail").value = email;
                    document.getElementById("name").focus();
                    document.getElementById("pass").required = false;
                    document.getElementById("pass").readOnly = true;
                    document.getElementById("pass").style.background = 'gainsboro';
                    document.getElementById("pass").style.opacity = '70%';
                    document.getElementById("pass").style.border = 'hidden';
                    document.getElementById("pass").placeholder ="*********";
                }
            });
            // window.location.href='/ex/kakao_login.html' //리다이렉트 되는 코드
            },
                fail: function(error) {
                    console.log(error);
                    alert("모든 동의항목 체크바랍니다.");
                }
            });
        }

function emailLogin(){
    document.getElementById("kakaoBtn").style.display = "none";
    document.getElementById("emailBtn").style.display = "none";
    document.getElementById("logiBtn").style.display = "";
    document.getElementById("kakaoInfo").style.display = "flex";

    document.getElementById("mail").focus();
}

function kakaoLogin(){
    window.Kakao.Auth.login({
        scope: 'account_email, birthday', //동의항목 페이지에 있는 개인정보 보호 테이블의 활성화된 ID값을 넣습니다.
        success: function(response) {
            window.Kakao.API.request({ // 사용자 정보 가져오기
                url: '/v2/user/me',
                success: (res) => {
                    document.getElementById("kakaoBtn").style.display = "none";
                    document.getElementById("emailBtn").style.display = "none";
                    document.getElementById("logiBtn").style.display = "";
//                    document.getElementById("kakaoInfo").style.display = "flex";
                    const kakao_account = res.kakao_account;
                    var email = kakao_account['email'];
                    var birthday = kakao_account['birthday'];

                    document.getElementById("mail").readOnly = true;
                    document.getElementById("mail").value = email;
                    document.getElementById("pass").value = email + birthday;
                    document.getElementById("logiBtn").click();
//                    document.getElementById("name").value = username;
//                    document.getElementById("gen").value = gender;
//                    document.getElementById("birth").value = birthday;
                }

            })
        }
    })
}

function loginWithKakao() {
    Kakao.Auth.authorize({
      redirectUri: 'https://developers.kakao.com/tool/demo/oauth',
      state: 'username',
    });
  }


  // 아래는 데모를 위한 UI 코드입니다.
displayToken()
function displayToken() {
var token = getCookie('authorize-access-token');

if(token) {
  Kakao.Auth.setAccessToken(token);
  document.querySelector('#token-result').innerText = 'login success, ready to request API';
  document.querySelector('button.api-btn').style.visibility = 'visible';
}
}

function getCookie(name) {
var parts = document.cookie.split(name + '=');
if (parts.length === 2) { return parts[1].split(';')[0]; }
}



var today = new Date();
var index=0;
index=0;
for(var m=1; m<=12; m++){
	document.getElementById('select_month').options[index] = new Option(m, m);
	index++;
}

lastday();

function lastday(){ //년과 월에 따라 마지막 일 구하기
	var Month=document.getElementById('select_month').value;
	var day=new Date(new Date(Year,Month,1)-86400000).getDate();
    /* = new Date(new Date(Year,Month,0)).getDate(); */

	var dayindex_len=document.getElementById('select_day').length;
	if(day>dayindex_len){
		for(var i=(dayindex_len+1); i<=day; i++){
			document.getElementById('select_day').options[i-1] = new Option(i, i);
		}
	}
	else if(day<dayindex_len){
		for(var i=dayindex_len; i>=day; i--){
			document.getElementById('select_day').options[i]=null;
		}
	}
}