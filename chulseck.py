from flask import Flask, url_for, render_template, request, redirect, session, jsonify, flash, send_file
from datetime import datetime
from model2 import db
import settings

now = datetime.now()

month = {'01': '31', '02': '29', '03': '31', '04': '30', '05': '31', '06': '30',
         '07': '31', '08': '31', '09': '30', '10': '31', '11': '30', '12': '31'}


def get_addr():
    client_ip = request.remote_addr
    return client_ip


def user_info():
    user_agent = request.user_agent.string
    user_agent = user_agent.replace(";", "")
    # if "Linux" in user_agent:
    #     user_agent = user_agent.replace('(', '')
    #     user_agent = user_agent.replace(')', '')
    #     user_agent = user_agent.split(';')
    #     print(user_agent)
    #     user_agent[2] = user_agent[2].split(",")
    # else:
    #     user_agent = user_agent.replace('(', '')
    #     user_agent = user_agent.replace(')', '')
    #     print(user_agent)
    # print(user_agent)
    # print(type(user_agent_nama))
    # print('브라우저',user_agent_nama.browser)
    # print('플랫폼',user_agent_nama.platform)
    # print('버전',user_agent_nama.version)
    # print('언어', user_agent_nama.language)
    return user_agent[user_agent.find("(")+1:user_agent.find(")")]


def people_calc(n):
    print("#####people_calc#####")
    print(n)  # 저장하려는 명단

    man_count = 0
    woman_count = 0

    person = list(db.user.find({"userid": n}, {'_id': False, 'password': False}))
    print(person)
    if person[0]['gender'] == 'female':
        woman_count += 1
    elif person[0]['gender'] == 'male':
        man_count += 1
    result = {"남": man_count, "여": woman_count, "합": man_count + woman_count}

    print("result ", result)

    return result


def write_qrcode(dic):
    print("/review_QR")
    title_receive = dic['title']
    #  print(i)
    ManCount = 0
    WomanCount = 0

    person = list(db.peopleList.find({"이름": dic['이름']}, {'_id': False}))
    print(person)
    if person[0]['성별'] == list('여'):
        WomanCount += 1
    elif person[0]['성별'] == list('남'):
        ManCount += 1
    result = "남 : ", str(ManCount), "<br>여 : ", str(WomanCount), "<br>합 : ", str(ManCount + WomanCount)
    print("result ", result)

    review_receive_count = result
    list_people = str()
    list_result = str()
    for _ in review_receive_count:
        list_result += " " + _
        print("리스트 결과" + list_result)
    doc = {
        'year': now.today().year,
        'title': dic['title'],
        'review': list_people,
        'count': list_result  # 인원명단 + 밑에 남여합 출력하기위해
    }
    print(review_receive_count)

    db.chulseck.insert_one(doc)
    return jsonify({'msg': '저장성공!'})





def mac_for_ip(ip):
    # arp_table = get_arp_table()
    #
    # for entry in arp_table:
    #     if entry['IP address'] == ip:
    #         return entry['HW address']
    return None


def week_cal(ryear, rmonth, rdate):
    year, week_number, _ = datetime.strptime(str(str(ryear)+"-"+rmonth+"-"+rdate), '%Y-%m-%d').isocalendar()
    # print(week_number)
    return week_number