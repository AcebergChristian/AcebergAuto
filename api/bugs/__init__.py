from flask import Blueprint, render_template, request, jsonify
from flask import Flask, jsonify, request
from flask_jwt_extended import get_jwt_identity
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


bugs_blueprint = Blueprint("bugs_module", __name__)


# bugs 组件里创建接口
@bugs_blueprint.route("/bugs_create", methods=["POST"])
@validate_token
def bugs_create():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))

    key = str(uuid4())
    product= params.get('product', '')
    module = params.get('module', '')
    version = params.get('version', '')
    assigner = params.get('assigner', '')
    enddatetime = params.get('enddatetime', '')
    feedbackor = params.get('feedbackor', '')
    mail = params.get('mail', '')
    bugtype = params.get('bugtype', '')
    system = params.get('system', '')
    browser = params.get('browser', '')
    title = params.get('title', '')
    bugcontent = params.get('bugcontent', '')
    demand = params.get('demand', '')
    ccto = params.get('ccto', '')
        
    
    # 获取当前用户的 ID
    current_user = get_jwt_identity()
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    newbugs = {
        'key': key,
        'product': product,
        'module': module,
        'version': version,
        'assigner': assigner,
        'enddatetime': enddatetime,
        'feedbackor': feedbackor,
        'mail': mail,
        'bugtype': bugtype,
        'system': system,
        'browser': browser,
        'title': title,
        'bugcontent': bugcontent,
        'demand': demand,
        'ccto': ccto,
        'isdel':'0',
        'creator':current_user,
        'createtime': time,
    }
    print('============>', newbugs)
  
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            rows_affected = cursor.insert_data("bugs", newbugs) 
        if rows_affected > 0:
            response = jsonify({"msg": "Create Data Success!", "status": "success"})
        else:
            response = jsonify({"msg": "Create Error!", "status": "error" })
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
            
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"

    return response



@bugs_blueprint.route("/bugs_query", methods=["POST"])
@validate_token
def bugs_query():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    # select * from bugs LIMIT 5,2
    current = params.get('current', 0)
    pagesize = params.get('pagesize', 10)
    product = params.get('product', '')
    title = params.get('title', '')
    bugcontent = params.get('bugcontent', '')
    
    # 获取当前用户的 ID
    current_user = get_jwt_identity()

    try:
        with SQLiteClass("acebergauto.db") as cursor:
            condition = "creator='{}' and isdel='0'".format(current_user)
            if product:
                condition += " and product LIKE '%{}%'".format(product)
            if title:
                condition += " and title LIKE '%{}%'".format(title)
            if bugcontent:
                condition += " and bugcontent LIKE '%{}%'".format(bugcontent)
            
            total = cursor.cursor.execute("SELECT count(key) from bugs where {}".format(condition)).fetchone()[0]
            condition += " limit {},{}".format(current, pagesize)
            data = cursor.select_data("bugs", condition=condition)
            

        res = {'data':data, 'total':total}
        response = jsonify({"msg": "Query Success! ", "status": "success", "data": res})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response

# 更新接口
@bugs_blueprint.route("/bugs_update", methods=["POST"])
@validate_token
def bugs_update():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    key = params.get("key", "")
    product = params.get("product", "")
    module = params.get("module", "")
    version = params.get("version", "")
    assigner = params.get("assigner", "")
    enddatetime = params.get("enddatetime", "")
    feedbackor = params.get("feedbackor", "")
    mail = params.get("mail", "")
    bugtype = params.get("bugtype", "")
    system = params.get("system", "")
    browser = params.get("browser", "")
    title = params.get("title", "")
    bugcontent = params.get("bugcontent", "")
    demand = params.get('demand', '')
    ccto = params.get('ccto', '')
    
    
    updatebugs = {
        'product': product,
        'module': module,
        'version': version,
        'assigner': assigner,
        'enddatetime': enddatetime,
        'feedbackor': feedbackor,
        'mail': mail,
        'bugtype': bugtype,
        'system': system,
        'browser': browser,
        'title': title,
        'bugcontent': bugcontent,
        'demand': demand,
        'ccto': ccto,
    }
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("bugs", updatebugs, condition="key='{}'".format(key))
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
@bugs_blueprint.route("/bugs_del", methods=["POST"])
@validate_token
def bugs_del():
    # 获取参数
    params = json.loads(request.data.decode("utf-8"))
    
    key = params.get("key", None)
    
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.update_data("bugs", {'isdel' : '1'}, condition="key='{}'".format(key))

        response = jsonify({"msg": "Delete Success! ", "status": "success", "data": data})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response



# 查询当前所有用户
@bugs_blueprint.route("/usrlist", methods=["GET"])
@validate_token
def usrlist():
    try:
        with SQLiteClass("acebergauto.db") as cursor:
            data = cursor.select_data("users", 'account', condition=" isdel='0' ")
        
        res = [ item['account'] for item in data]
        print(res)
        response = jsonify({"msg": "Query Success! ", "status": "success", "data": res})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    except Exception as e:
        response = jsonify({"msg": str(e), "status": "error", "data": str(e)})
        response.status_code = 200
        response.headers["Content-Type"] = "application/json; charset=utf-8"


    return response