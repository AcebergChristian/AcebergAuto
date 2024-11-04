from flask import Blueprint, render_template, request, jsonify
from flask import Flask, jsonify, request
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from utils.sql import SQLiteClass
from functools import wraps
from utils.common import validate_token
from utils.common import allowed_file
from utils.common import savefile
from utils.ai import to_vectorstore
import json
import datetime
from uuid import uuid4


users_blueprint = Blueprint("users_module", __name__)


# users 组件里创建接口
@users_blueprint.route("/users_create", methods=["POST"])
@validate_token
def users_create():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))

    key = str(uuid4())
    account= params.get("account", None)
    password = params.get("password", None)
    role = params.get("role", None)
    # 将密码哈希化
    hashed_password = generate_password_hash(password)
    
    # 获取当前用户的 ID
    current_user = get_jwt_identity()
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    newusers = {
        'key': key,
        'account':account,
        'password':hashed_password,
        'role':role,
        'isdel':'0',
        'creator':current_user,
        'createtime': time,
    }
    print('============>', newusers)
  
    try:
        # 重复值校验
        with SQLiteClass("acebergauto.db") as cursor:
            isexisted = cursor.select_data("users", condition="account='{}'".format(account))
        if isexisted:
            return jsonify({"msg": "The account already exists!", "status": "error"}), 200
        else:
            # 插入数据
            with SQLiteClass("acebergauto.db") as cursor:
                rows_affected = cursor.insert_data("users", newusers) 
            if rows_affected > 0:
                response = jsonify({"msg": "Create Success!", "status": "success"})
            else:
                response = jsonify({"msg": "Create Error!", "status": "error" })
            response.status_code = 200
            response.headers["Content-Type"] = "application/json; charset=utf-8"
            
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"

    return response



@users_blueprint.route("/users_query", methods=["POST"])
@validate_token
def users_query():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    # select * from users LIMIT 5,2
    current = params.get("current", None)
    pagesize = params.get("pagesize", None)
    # 获取当前用户的 ID
    current_user = get_jwt_identity()

    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.select_data("users", condition="creator='{}' and isdel='0' limit {},{}".format(current_user, current, pagesize)) 
            total = cursor.cursor.execute("SELECT count(key) from users where creator='{}' and isdel='0'".format(current_user)).fetchall() 

        res = {'data':data, 'total':total[0][0]}
        response = jsonify({"msg": "Query Success! ", "status": "success", "data": res})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response

# 更新接口
@users_blueprint.route("/users_update", methods=["POST"])
@validate_token
def users_update():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    key = params.get("key", None)
    account = params.get("account", None)
    password = params.get("password", None)
    role = params.get("role", None)
    
    password_hash = generate_password_hash(password)
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("users", {'account':account, 'password':password_hash,'role' : role}, condition="key='{}'".format(key))
        if data:
            response = jsonify({"msg": "Update Success! ", "status": "success", "data": data})
            response.status_code = 200
            response.headers["Content-Type"] = "application/json; charset=utf-8"
        else:
            response = jsonify({"msg": "Update Failed! ", "status": "error", "data": data})
            response.status_code = 200
            response.headers["Content-Type"] = "application/json; charset=utf-8"
            
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"

    return response


# 删除接口
@users_blueprint.route("/users_del", methods=["POST"])
@validate_token
def users_del():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    key = params.get("key", None)
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("users", {'isdel' : '1'}, condition="key='{}'".format(key))

        response = jsonify({"msg": "Delete Success! ", "status": "success", "data": data})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response

