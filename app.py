#!/usr/local/bin/python3
# -*- coding: utf-8 -*-
import account
from flask import Flask, url_for, render_template, request, redirect, session, jsonify, flash, send_file
from datetime import datetime
import chulseck
from model2 import db
import numpy as np

from email.message import EmailMessage
import smtplib

now = datetime.now()
app = Flask(__name__)

app.register_blueprint(account.blue_account)

# 파일 업로드 위치
app.config['UPLOAD_FOLDER'] = 'static/upload/'


@app.route('/')  # HTML을 주는 부분
def index():
    print('## index ##')
    if not session.get("username"):
        print('Client_ip : ', chulseck.get_addr(), 'User_info : ', chulseck.user_info())
    else:
        print("ID : ", session.get("username"), ' Client_ip : ', chulseck.get_addr(), 'User_Info : ', chulseck.user_info())
    return render_template('index.html')


@app.route('/access', methods=["GET"])
def index_access():
    print('## index_access ##')
    people_list = list(db.user.find({'company': session.get('company')}, {'_id': False, 'password': False}))
    not_access_list = list()
    guest_list = list()
    admin_list = list()
    for i in people_list:
        if i['auth'] == 'x':
            not_access_list.append(i)
        elif i['auth'] == '0':
            guest_list.append(i)
        elif i['auth'] == '1':
            admin_list.append(i)
    return jsonify({'x': not_access_list, '0': guest_list, '1': admin_list})


@app.route('/accessGuest', methods=["POST"])
def index_access_guest():
    print("## index_access_guest ##")
    db.user.update_one({'userid': request.form['id']}, {"$set": {'auth': "0", 'certified': 'o'}})
    return jsonify({"msg": True})


@app.route('/accessMaster', methods=["POST"])
def index_access_master():
    print("## index_accessMaster ##")
    db.user.update_one({'userid': request.form['id']}, {"$set": {'auth': "1"}})
    db.user.update_one({'userid': session['userid']}, {"$set": {'auth': "0"}})
    session['auth'] = "0"
    return jsonify({"msg": True})


@app.route('/accessDel', methods=["POST"])
def index_access_del():
    print("## index_access_del ##")
    db.user.update_one({'userid': request.form['id']}, {"$set": {'auth': 'del', "certified": 'del'}})
    return jsonify({"msg": True})


@app.route('/userAttendance', methods=["POST"])
def index_user_attendance():
    print("## userAttendance ##")
    receive_year = request.form['year']
    receive_month = request.form['month']
    receive_day = request.form['day']

    c = list(db.chulseck.find({'company': session.get('company')}, {'_id': False}).sort('yearDate', 1))
    p = list(db.user.find({'company': session.get('company'), 'userid': session.get('userid')}, {'_id': False, 'password': False}))

    if int(str(receive_month) + str(receive_day)) >= 1101:  # 임기 변경
        dateline_year = receive_year
        date_range = [str(dateline_year) + str(1101), str(int(dateline_year) + 1) + '0930']
        wn = chulseck.week_cal(receive_year, receive_month, receive_day) - chulseck.week_cal(date_range[0][0:4], date_range[0][4:6], date_range[0][6:])
    else:
        dateline_year = str(int(receive_year) - 1)
        date_range = [str(dateline_year) + str(1101), str(int(dateline_year) + 1) + '0930']
        wn = chulseck.week_cal(receive_year, receive_month, receive_day) + 52 - chulseck.week_cal(date_range[0][0:4], date_range[0][4:6], date_range[0][6:])

    li = []

    for i in c:
        if int(str(dateline_year) + str(1101)) <= int(i['yearDate']) <= int(str(int(dateline_year) + 1) + '0930') and session.get('userid') in i['userid'].split(' '):
            li.append(int(i['yearDate']))

    return jsonify({"msg": True, "p": p, 'li': li, 'dr': date_range, 'wn': wn+1})


@app.route('/check')
def check():
    print("## check_access ##", session.get("username"))
    return render_template('check.html')


@app.route('/check_qr')
def check_qr():
    print('## checkQR_access ##', " ID : ", session.get("username"))
    return render_template('checkq.html')


@app.route('/chul_get', methods=['GET'])
def chul_get():
    print("##  chul_get  ## ID : ", session.get("username"))
    chul = list(db.chulseck.find({'company': session.get("company")}, {'_id': False}).sort("yearDate", -1))

    for i in chul:
        i['name'] = ' '.join(sorted(i['name'].split(' ')))
    return jsonify({'all_check': chul})


@app.route('/autoSave', methods=['GET'])
def autoSave():
    print('/autoSave')

    c = list(db.chulseck.find({'company': session.get('company')}, {'_id': False}))
    p = list(db.user.find({'company': session.get('company'), 'auth': '1'}, {'_id': False, 'password': False}))

    result = ''
    for i in c:
        i['name'] = ' '.join(sorted(str(i['name']).split(' ')))
        result += str(i['year']) + '년 ' + str(i['date'][:2]) + "월 " + str(i['date'][2:]) + "일 출석 " + str(i[
            'name']) + ' / 남 :' + str(i['male']) + ' 여 :' + str(i['female']) + ' 합 : ' + str(i['hap']) + "\n\n"
    # print(result)
    now = datetime.now()

    # STMP 서버의 url과 port 번호
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 465

    # 1. SMTP 서버 연결
    smtp = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)

    EMAIL_ADDR = 'naochugu@gmail.com'

    EMAIL_PASSWORD = EMAIL_PASS

    # 2. SMTP 서버에 로그인
    smtp.login(EMAIL_ADDR, EMAIL_PASSWORD)
    # 3. MIME 형태의 이메일 메세지 작성
    for i in p:
        print(i)
        message = EmailMessage()
        message.set_content(result + '\n\n\nhttp://zion' + now.date().strftime("%Y") + ".site\n" +
                            "https://port-0-zion-flask-k19y2kljzuim4t.sel4.cloudtype.app/")  # 내용
        message["Subject"] = "[진주교회" + session.get("company") + "]" + now.date().strftime("%Y/%m/%d") + " 출석백업"  # 제목
        message["From"] = EMAIL_ADDR  # 보내는 사람의 이메일 계정
        message["To"] = i['email']  # 받는 사람
        smtp.send_message(message)  # 4. 서버로 메일 보내기

    # 5. 메일을 보내면 서버와의 연결 끊기
    smtp.quit()
    return jsonify({'msg': "메일전송!"})


@app.route('/oneModi', methods=['POST'])
def chul_save():
    print("##  oneModi  ##", " ID : ", session.get("username"))
    date = request.form['date']
    print(date)
    if date == 'today':
        date = now.strftime("%m%d")
    person_id = request.form['id']

    chul = list(db.chulseck.find({'company': session.get("company"), 'date': date}, {'_id': False}))
    person = list(db.user.find({'company': session.get("company"), 'userid': person_id}, {'_id': False, 'password': False}))
    print(person)
    if not chul:  # 해당 날짜에 기록없음
        count = chulseck.people_calc(person_id)
        doc = {
            'yearDate': str(int(now.strftime("%Y")))+str(date),
            'year': int(now.strftime("%Y")),
            'date': date,
            'userid': person_id,
            'male': count['남'],
            'female': count['여'],
            'hap': count['합'],
            'company': session.get('company'),
            'name': person[0]['username']
        }
        db.chulseck.insert_one(doc)
    else:
        if len(chul[0]['userid'].split(' ')) != 1:
            print('이름 비교')
            for i, c in enumerate(chul[0]['userid'].split(' ')):
                if c == person_id:
                    a = chul[0]['userid'].split(' ')
                    b = chul[0]['name'].split(' ')
                    del a[i]
                    del b[i]
                    str_a = ' '.join(a)
                    str_b = ' '.join(b)
                    db.chulseck.update_one({'year': int(chul[0]['year']), 'date': chul[0]['date'], 'company': session.get('company')},{
                        "$set": {
                            'userid': str_a, 'name': str_b,
                            str(person[0]['gender']): chul[0][str(person[0]['gender'])] - 1,
                            'hap': chul[0]['hap'] - 1}})
                    return jsonify({'msg': True})

        else:
            if chul[0]['userid'] == person_id:
                db.chulseck.delete_one({'year': int(chul[0]['year']), 'date': chul[0]['date'], 'company': session.get('company')})
                return jsonify({'msg': True})

        # +시킴
        db.chulseck.update_one({'year': int(chul[0]['year']), 'date': chul[0]['date'], 'company': session.get('company')},  {
            "$set": {
                'userid': person_id + " " + chul[0]['userid'],
                'name': person[0]['username'] + ' '+chul[0]['name'],
                str(person[0]['gender']): chul[0][str(person[0]['gender'])] + 1,
                'hap': chul[0]['hap']+1}
        })

    return jsonify({'msg': True})


@app.route('/autoCheck', methods=['POST'])
def chul_auto_check():
    print("## autoCheck ##")
    date = str(request.form['sdate'])
    send_result = list(db.chulseck.find({'company': session.get('company'), 'year': int(date[:4]), 'date': date[4:]}, {'_id': False}).sort('yearDate', 1))
    if not send_result:
        return jsonify({'msg': '해당하는 날짜에 저장된 데이터가 없습니다.'})
    else:
        print(send_result[0]['date'])
        print(send_result[0]['name'])
        print(send_result[0]['hap'])
        return jsonify({'result': send_result})


@app.route('/getDB', methods=['GET'])
def read_people_db():
    print('## getDB ##')
    people = list(db.user.find({'company': session.get('company'), 'certified': 'o'}, {'_id': False, 'password': False}).sort('username', 1))
    return jsonify({'dbP': people})


@app.route('/groupSave', methods=["POST"])
def group_save():
    group = list(request.form['group_fix'].split('/'))
    print(group)
    group_name = ''
    for i in group:
        for n in range(0, len(i.split(' '))-1):
            if n == 0:
                group_name = i.split(' ')[0]
            else:
                db.user.update_one({'userid': i.split(' ')[n], 'company': session.get('company')}, {"$set": {'group': group_name}})
    return jsonify({"msg": True})


@app.route('/modalInfo', methods=["POST"])
def modal_info():
    print('## modalInfo ##')
    userid = list(db.user.find({'userid': request.form['id'], 'company': session.get('company')}, {'_id': False, 'password': False}))
    return jsonify({'info': userid})


@app.route('/modalSignificant', methods=['POST'])
def modal_significant():
    print('## modal_significant ##')
    db.user.update_one({'userid': request.form['id'], 'company': session.get('company')}, {"$set": {'significant': request.form['si']}})
    return jsonify({'msg': True})


@app.route("/graph")
def graph_access():
    print("## graph ##")
    return render_template('graph.html')


@app.route('/getTChul', methods= ['GET'])
def get_table_chul():
    print('/getTChul')
    c = list(db.chulseck.find({'company': session.get('company')}, {'_id': False}).sort('yearDate', 1))
    p = list(db.user.find({'company': session.get('company')}, {'_id': False, 'password': False}).sort('username', 1))
    chul = []

    receive_year = datetime.today().year
    receive_month = datetime.today().month
    receive_day = datetime.today().day

    if int(str(receive_month) + str(receive_day)) >= 1101:  # 임기 변경
        dateline_year = receive_year
    else:
        dateline_year = str(int(receive_year) - 1)

    date_range = [str(dateline_year) + str(1101), str(int(dateline_year) + 1) + '0930']

    li = []  # 불러 온 날짜를 임기에 맞게 범위 지정

    for i in c:
        if int(date_range[0]) <= int(i['yearDate']) <= int(date_range[1]):
            li.append(i)

    for i in p:
        are = []
        cnt = 0
        are.append(i['username'])
        for _ in li:
            if i['userid'] in _['userid'].split(' '):
                are.append("1")
                cnt += 1
            else:
                are.append(".")
        per = str(int(cnt/len(c)*100)) + str("%")
        are.insert(1, per)
        chul.append(are)
    return jsonify({"date": li, 'chul': chul})


@app.route('/getAttendanceGraph', methods=['GET'])
def get_attendance_graph():
    print('## getAttendanceGraph ##')
    c = list(db.chulseck.find({'company': session.get('company')}, {'_id': False}).sort('yearDate', 1))
    p = list(db.user.find({'company': session.get('company'), 'certified': 'o'}, {'_id': False, 'password': False}))

    receive_year = datetime.today().year
    receive_month = datetime.today().month
    receive_day = datetime.today().day

    if int(str(receive_month) + str(receive_day)) >= 1101:  # 임기 변경
        dateline_year = receive_year
    else:
        dateline_year = str(int(receive_year) - 1)

    date_range = [str(dateline_year) + str(1101), str(int(dateline_year) + 1) + '0930']
    li = []
    s = ''
    for i in c:
        if int(date_range[0]) <= int(i['yearDate']) <= int(date_range[1]):
            s += i['userid'] + ' '

    s = np.array(s.split())
    for i in p:
        print(i['username'], i['userid'])
        li.append([i['username'], i['userid'], np.count_nonzero(s == i['userid'])])

    li.sort(key=lambda x: -x[2])
    print(li)
    return jsonify({"chul": li})


@app.route('/secret', methods=["POST"])
def get_secret():
    apikey = java_api
    return jsonify({"api": apikey})


@app.route('/copyChul', methods = ["POST"])
def copy_chul():
    ryear = str(request.form['year'])
    rdate = str(request.form['date'])
    print(ryear, rdate)
    send_result = list(db.chulseck.find({'company': session.get('company'), 'year': int(ryear), 'date': rdate}, {'_id': False}))

    if send_result:
        name = ' '.join(sorted(str(send_result[0]['name']).split(' ')))
        male = str(send_result[0]['male'])
        female = str(send_result[0]['female'])
        result = ryear + rdate + " - " + name + " 남 " + male + "명 여 " + female + "명 합 " + str(int(male)+int(female)) + "명"
        print(result)
        return jsonify({'msg': result})
    else:
        return jsonify({'msg': '해당 날짜에 출석한 인원이 없습니다.'})


if __name__ == '__main__':
    app.secret_key = app_secret
    app.run('0.0.0.0', debug=True)
