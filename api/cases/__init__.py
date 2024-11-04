from flask import Blueprint, render_template, request, jsonify
from flask import Flask, jsonify, request
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename
from utils.sql import SQLiteClass
from functools import wraps
from utils.common import validate_token, allowed_file, ActionGo, requestApi, runtores
import json
import datetime
from uuid import uuid4
from playwright.sync_api import sync_playwright


cases_blueprint = Blueprint("cases_module", __name__)


# cases 组件里创建接口
@cases_blueprint.route("/cases_create", methods=["POST"])
@validate_token
def cases_create():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))

    key = str(uuid4())
    product = params.get("product", "")
    module = params.get("module", "")
    casetype = params.get("casetype", "")
    stage = params.get("stage", "")
    title = params.get("title", "")
    priority = params.get("priority", "")
    precondition = params.get("precondition", "")
    testtype = params.get("testtype", "")
    testcontent = params.get("testcontent", "")
    
    # 获取当前用户的 ID
    current_user = get_jwt_identity()
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    newcases = {
        'key': key,
        'product':product,
        'module':module,
        'casetype':casetype,
        'stage':stage,
        'title': title,
        'priority':priority,
        'precondition':precondition,
        'testtype':testtype,
        'testcontent':json.dumps(testcontent, ensure_ascii=False),
        'isdel':'0',
        'creator':current_user,
        'createtime': time,
    }
  
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            rows_affected = cursor.insert_data("cases", newcases) 
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



# Modal 里的action
@cases_blueprint.route("/cases_uploadaction", methods=["POST"])
# @validate_token
def cases_uploadaction():
    if 'files' not in request.files:
        return jsonify({"msg": "files not available", "status": "error"}), 400

    try:
        files = request.files.getlist('files')
        
        uploaded_files = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                uploaded_files.append(filename)
                
            else:
                return jsonify({"msg": "File type not allowed", "status": "error"}), 400
        
        response = jsonify({"msg": "Upload Success!", "status": "success", "files": uploaded_files}), 200
    
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
    
    return response



@cases_blueprint.route("/cases_query", methods=["POST"])
@validate_token
def cases_query():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    # select * from cases LIMIT 5,2
    current = params.get("current", None)
    pagesize = params.get("pagesize", None)
    # 获取当前用户的 ID
    current_user = get_jwt_identity()

    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.select_data("cases", condition="creator='{}'and isdel='0' limit {},{}".format(current_user, current, pagesize)) 
            total = cursor.cursor.execute("SELECT count(key) from cases where creator='{}' and isdel='0'".format(current_user)).fetchall() 

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
@cases_blueprint.route("/cases_update", methods=["POST"])
@validate_token
def cases_update():
   # 获取参数
    params = json.loads(request.data.decode("utf-8"))

    key = params.get("key", "")
    product = params.get("product", "")
    module = params.get("module", "")
    casetype = params.get("casetype", "")
    stage = params.get("stage", "")
    title = params.get("title", "")
    priority = params.get("priority", "")
    precondition = params.get("precondition", "")
    testtype = params.get("testtype", "")
    testcontent = params.get("testcontent", "")
    
    newcases = {
        'key':key,
        'product':product,
        'module':module,
        'casetype':casetype,
        'stage':stage,
        'title': title,
        'priority':priority,
        'precondition':precondition,
        'testtype':testtype,
        'testcontent':json.dumps(testcontent, ensure_ascii=False),
    }
    
    print(newcases)
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("cases", newcases, condition="key='{}'".format(key))
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
@cases_blueprint.route("/cases_del", methods=["POST"])
@validate_token
def cases_del():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    key = params.get("key", None)
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("cases", {'isdel' : '1'}, condition="key='{}'".format(key))

        response = jsonify({"msg": "Delete Success! ", "status": "success", "data": data})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response



# 单个运行case
@cases_blueprint.route("/cases_runone", methods=["POST"])
@validate_token
def cases_runone():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    testtype = params.get("testtype", None)
    testcontent = json.loads(params.get("testcontent", None))
    
    
    try:
        if testtype == 'auto':
            with sync_playwright() as playwright:
                action = ActionGo(playwright)
                for item in testcontent:
                    res = action(item['action'],item['element'],item['content'])

            if res == False or res == None or res == 'error':
                params.update({"testres":"0"})
                runtores(params)
                response = jsonify({"msg": "Run Fail! ", "status": "error"})
                response.status_code = 200
                response.headers["Content-Type"] = "application/json; charset=utf-8"
            else:
                params.update({"testres":"1"})
                runtores(params)
                response = jsonify({"msg": "Run Success! ", "status": "success"})
                response.status_code = 200
                response.headers["Content-Type"] = "application/json; charset=utf-8"
        else:
            res = requestApi(testcontent)
            if res:
                params.update({"testres":"1"})
                runtores(params)
                response = jsonify({"msg": "Run Success! ", "status": "success","data": res})
                response.status_code = 200
                response.headers["Content-Type"] = "application/json; charset=utf-8"
            else:
                params.update({"testres":"0"})
                runtores(params)
                response = jsonify({"msg": "Run Fail! ", "status": "error"})
                response.status_code = 200
                response.headers["Content-Type"] = "application/json; charset=utf-8"          
        
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response


# 单个运行case
@cases_blueprint.route("/casesresall", methods=["GET"])
@validate_token
def casesresall():
    current_user = get_jwt_identity()
    with SQLiteClass("acebergauto.db") as cursor:
        data = cursor.select_data("cases_res", condition="creator='{}' and isdel ='0'".format(current_user))
    
    response = jsonify({"msg": "Query Success!", "status": "success", "data": data})
    response.status_code = 200
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    
    return response