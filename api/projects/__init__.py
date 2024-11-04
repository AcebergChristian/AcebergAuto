from flask import Blueprint, render_template, request, jsonify
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError, InvalidHeaderError, RevokedTokenError
from utils.sql import SQLiteClass
from functools import wraps
from utils.common import validate_token
import json
import datetime
from uuid import uuid4

projects_blueprint = Blueprint("projects_module", __name__)



# projects 组件里创建接口
@projects_blueprint.route("/projects_create", methods=["POST"])
@validate_token
def projects_create():

    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    id = str(uuid4())
    title= params.get("title", None)
    desc = params.get("desc", None)
    # 获取当前用户的 ID
    current_user = get_jwt_identity()
    newprojects = {
        'id': id,
        'title':title,
        'desc':desc,
        'creator':current_user,
        'createtime': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'isdel':'0',
    }
    print(newprojects)
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            rows_affected = cursor.insert_data("projects", newprojects) 
        if rows_affected > 0:
            response = jsonify({"msg": "Create Success!", "status": "success", "data": newprojects})
        else:
            response = jsonify({"msg": "Create Error!", "status": "error", "data": newprojects})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
            
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response


@projects_blueprint.route("/projects_query", methods=["POST"])
@validate_token
def projects_query():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    # 获取当前用户的 ID
    current_user = get_jwt_identity()
    print(current_user)
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            if current_user == "admin":
                data = cursor.select_data("projects", condition="isdel='0'")
            else:
                data = cursor.select_data("projects", condition="creator='{}' and isdel='0'".format(current_user))
        
        response = jsonify({"msg": "Query Success! ", "status": "success", "data": data})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response

# 更新接口
@projects_blueprint.route("/projects_update", methods=["POST"])
@validate_token
def projects_update():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    print(params)
    id = params.get("id", None)
    title = params.get("title", None)
    desc = params.get("desc", None)
    module = params.get("module", None)
    
    jsondata = {"title": title, "desc": desc, "module": module}
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("projects", jsondata, condition="id='{}'".format(id))

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
@projects_blueprint.route("/projects_del", methods=["POST"])
@validate_token
def projects_del():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    id = params.get("id", None)
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("projects", {'isdel' : '1'}, condition="id='{}'".format(id))

        response = jsonify({"msg": "Delete Success! ", "status": "success", "data": data})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response



# 所有当前创建人创建项目的接口
@projects_blueprint.route("/projects_list", methods=["POST"])
@validate_token
def projects_list():

    # 获取参数
    current_user = get_jwt_identity()
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.select_data("projects", 'title', condition="creator='{}' and isdel='0' ".format(current_user))
        
        res = [ item['title'] for item in data]

        response = jsonify({"msg": "Query Success! ", "status": "success", "data": res})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response


# 所有当前创建人创建项目的接口
@projects_blueprint.route("/projects_modules", methods=["POST"])
@validate_token
def projects_modules():
    
    params = json.loads(request.data.decode("utf-8"))
    product = params.get("product", "")
    print(product)
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.select_data("projects", 'module', condition="title='{}'".format(product))[0]['module']
        
        res = data.split(',')
        response = jsonify({"msg": "Query Success! ", "status": "success", "data": res})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response