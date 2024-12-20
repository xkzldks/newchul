from flask import Flask, Blueprint, flash, url_for
from flask import render_template, request, redirect, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from model2 import db
import chulseck
import re
from uuid import getnode
import socket

app = Flask(__name__)
# app.secret_key = settings.get_secret("app_secret")
blue_account = Blueprint("account", __name__, url_prefix="/account")


@blue_account.route("/sendFormat", methods=["POST"])
def r_format():
    login_format = request.form['i']
    session['loginFormat'] = login_format
    print(login_format)
    return jsonify({"msg": "good"})


@blue_account.route("/register", methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        birthday = request.form['birthday']
        try:
            gender = request.form['gender']
            company = request.form['check']
        except KeyError:
            flash('성별 및 부서를 선택해 주세요')
            return render_template("register.html")

        if session['loginFormat'] == 'email':
            password = request.form['password']
        else:
            password = email + birthday

        userid = email[:email.find("@")]
        birth_year = request.form['birth_year']
        if not list(db.user.find({"email": email})):
            user = {
                "username": username,
                "userid": userid,
                "password": generate_password_hash(password, method='sha256'),
                "email": email,
                "gender": gender,
                "birthday": birthday,
                "company": company,
                "auth": 'x',
                "significant": "",
                "birthyear": int(birth_year),
                "group": '새가족팀',
                "loginFormat": session['loginFormat'],
                'certified': 'x'
            }
            db.user.insert_one(user)
            flash('신청완료\\n승인 후 로그인 가능합니다.')
            return redirect('/')
        elif list(db.user.find({"email": email})):
            if list(db.user.find({"email": email}))[0]['certified'] == 'del':
                flash("삭제된 이력이 있는 계정입니다.\\n관리자에게 문의바랍니다.")
            else:
                flash("현재 존재하는 계정입니다.\\n관리자에게 문의바랍니다.")
            return render_template("register.html")
        else:
            flash("계정승인대기 상태입니다.\\n관리자에게 문의바랍니다.")
            return redirect("/")
    return render_template("register.html")


@blue_account.route("/login", methods=('GET', 'POST'))
def login():
    if request.method == "POST":
        print("/login")
        email = request.form['email']
        password = request.form['password']
        check_user = db.user.find_one({"email": email})
        userinfo = chulseck.user_info()
        if check_user:
            if check_user.get("auth") != 'x':
                if check_password_hash(check_user.get("password"), password):
                    inner_ip = request.remote_addr
                    session['username'] = check_user.get('username')
                    session['auth'] = check_user.get('auth')
                    session['userid'] = check_user.get('userid')
                    session['company'] = check_user.get('company')
                    session['loginFormat'] = check_user.get('loginFormat')
                    session['group'] = check_user.get('group')
                    flash("ID : " + check_user.get('username') + '\\nCompany : ' + check_user.get('company') + '\\nClient_ip : ' +inner_ip + '\\nUser_Info : ' + userinfo +'\\nMAC : ' + ':'.join(re.findall('..', '%012x' % getnode())))
                    return redirect("/")
                else:
                    flash("비밀번호 확인")
            else:
                flash("계정승인대기 상태입니다.\\n관리자에게 문의바랍니다.")
                return render_template("login.html")
        else:
            flash("계정이 없습니다.\\n관리자에게 문의바랍니다.")
            return render_template("login.html")
    return render_template("login.html")


@blue_account.route("/logout")
def logout():
    if session.get('username'):
        session.pop('username', None)
        session.pop('auth', None)
        session.pop('userid', None)
        session.pop('company', None)
        session.pop('loginFormat', None)
        session.pop('group',None)
        flash('로그아웃이 완료되었습니다.')
        return redirect('/')
