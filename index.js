/**
 * @author v25bh145
 * 协议： MIT协议
 * 新手随便敲敲
 */
let mysql = require("mysql");
let fs = require("fs");
let async = require("async");
let configPath = "./connect.json";
function sql(table = "", data = {}) {
  for (let key in data) {
    if (typeof data[key] === "string") {
      data[key] = '"' + data[key] + '"';
    }
  }
  let _conn = {};
  let _connectConfig = {};
  let _table = table;
  let _data = data;
  let _orderBy = "";
  let _limit = "";
  let _whereBinary = true;
  //默认多条where时，使用与逻辑(_whereList[0]["notUseArray"] === false)
  let _whereList = [
    { notUseArray: false },
    /*e.g:
        {key: "awa", value: "qwq", op: "+", rel: null},
        {key: "awa", value: "qwq", op: "+", rel: "and"}*/
  ];
  //如果要用一段字符串(_whereList[0]["notUseArray"] === true)
  let _whereStr = "";
  /**
   * 重新设置数据表
   * @param {String} newTable
   */
  this.setTable = (newTable) => {
    let that = this;
    _table = newTable;
    return that;
  };
  /**
   * 重新设置数据对象，用于插入和更新
   * 增加了对字符串的处理
   * @param {object} newData
   */
  this.setData = (newData) => {
    let that = this;
    for (let key in newData) {
      if (typeof newData[key] === "string") {
        newData[key] = '"' + newData[key] + '"';
      }
    }
    _data = newData;
    return that;
  };
  /**
   * 设置返回查询数据的顺序
   * 已有顺序则更换，顺序规则不符合则返回error
   * @param {String} key
   * @param {Number} orderType 默认ASC升序
   */
  this.orderBy = (key, rule = "ASC") => {
    let that = this;
    if (rule.toUpperCase() === "DESC") rule = "DESC";
    else if (rule.toUpperCase() === "ASC") rule = "ASC";
    else return "please input the correct rule.";
    _orderBy = {
      key: key,
      rule: rule,
    };
    return that;
  };
  /**
   * 设置一次查询返回多少条目
   * @param {Number} number
   */
  this.limit = (number) => {
    let that = this;
    if (number <= 0) return "please input the correct rule.";
    _limit = number;
    return that;
  };
  /**
   * 为true时，检查大小写，否则不检查
   * @param {bool} flag 默认为true
   */
  this.setBinary = (flag) => {
    let that = this;
    if (flag === true || flag === false) {
      _whereBinary = flag;
      return that;
    } else {
      return "please input bool type!";
    }
  };
  /**
   * 设置(添加)where限制
   * @param {String} key
   * @param {*} value
   * @param {String} op
   * @param {String} rel
   * @todo 智能为value提供输入格式转换
   */
  this.where = (key, value, op = "=", rel = "and") => {
    let that = this;
    if (_whereList[0]["notUseArray"] === true)
      _whereList[0]["notUseArray"] = false;
    if (typeof value === "string") value = '"' + value + '"';
    if (op.toUpperCase() === "LIKE") op = "LIKE";
    _whereList.push({
      key: key,
      value: value,
      op: op,
      rel: rel.toUpperCase(),
    });
    return that;
  };
  /**
   * 设置(重新设置)where限制，这个函数输入整个where语句的内容
   * @param {String} whereStr
   */
  this.whereSetByStr = (whereStr) => {
    let that = this;
    //直接来个新的where，原来的匹配被自动清除
    _whereList = [{ notUseArray: true }];
    _whereStr = whereStr;
    return that;
  };
  /**
   * 删除以下的所有子句配置
   */
  this.deleteAllSet = () => {
    let that = this;
    _conn = {};
    _connectConfig = {};
    _orderBy = "";
    _limit = "";
    _whereBinary = true;
    _whereList = [{ notUseArray: false }];
    _whereStr = "";
    return that;
  };
  /**
   * 检查不合法参数 有重复检查
   * 返回一个字符串
   */
  this.examine = () => {
    let that = this;
    if (typeof _table != "string") return "please input correct table_name!";
    else if (typeof _limit != "number" && _limit != "")
      return "please input correct limit!";
    else if (
      _orderBy.rule != "ASC" &&
      _orderBy.rule != "DESC" &&
      _orderBy != ""
    )
      return "please input correct orderBy!";
    else if (typeof _data != "object" && _data != "")
      return "please input correct data!";
    else if (_whereList[0].notUseArray == true && typeof _whereStr != "string")
      return "please input correct WHERE!";
    else if (_whereList[0].notUseArray == false) {
      for (let idx = 1; idx < _whereList.length; idx++) {
        if (typeof _whereList[idx].key != "string")
          return "please input correct key IN WHERE!";
        else if (
          _whereList[idx].op != "=" &&
          _whereList[idx].op != ">" &&
          _whereList[idx].op != "<" &&
          _whereList[idx].op != ">=" &&
          _whereList[idx].op != "<=" &&
          _whereList[idx].op != "!=" &&
          _whereList[idx].op != "LIKE"
        )
          return "please input correct operator in WHERE!";
        else if (
          _whereList[idx].rel != "AND" &&
          _whereList[idx].rel != "OR" &&
          _whereList[idx].rel != "NOT"
        )
          return "please input correct relation in WHERE!";
      }
    }
    //pass
    return null;
  };
  /**
   * insert语句
   * @param callback 回调函数
   */
  this.insert = (callback) => {
    let that = this;

    //校验
    let error = that.examine();
    if (error) {
      callback(error);
      return;
    }

    //构造sql
    let sql = "INSERT INTO " + _table + " (";
    let arrKey = [];
    let arrValue = [];
    for (let key in _data) {
      arrKey.push(key);
      arrValue.push(_data[key]);
    }
    for (let idx = 0; idx < arrKey.length - 1; idx++) {
      sql += arrKey[idx] + ", ";
    }
    sql += arrKey[arrKey.length - 1] + ") VALUES (";
    for (let idx = 0; idx < arrValue.length - 1; idx++) {
      sql += arrValue[idx] + ", ";
    }
    sql += arrValue[arrValue.length - 1] + ");";

    //还原配置
    that.deleteAllSet();

    //连接数据库，插入sql
    async.series(
      [
        function (asyncCallback) {
          fs.readFile(configPath, (err, data) => {
            _connectConfig = JSON.parse(data);
            asyncCallback(null);
          });
        },
        function (asyncCallback) {
          _conn = mysql.createConnection(_connectConfig);
          _conn.query(sql, function (err, rows) {
            if (err) asyncCallback(err, "failed");
            else asyncCallback(null);
          });
        },
      ],
      function (error) {
        _conn.end();
        if (error) callback(error);
        else callback(null);
      },
    );
  };
  /**
   * select语句
   * @param callback 回调函数
   */
  this.select = (callback) => {
    let that = this;

    //校验
    let error = that.examine();
    if (error) {
      callback(error);
      return;
    }

    //构造sql
    let sql = "SELECT * FROM " + _table + " WHERE ";
    if (_whereBinary === true) sql += "BINARY ";
    if (_whereList[0]["notUseArray"] === true) {
      sql += _whereStr + " ";
    } else {
      let length = _whereList.length;
      if (length > 1) {
        sql +=
          _whereList[1].key +
          " " +
          _whereList[1].op +
          " " +
          _whereList[1].value +
          " ";
      } else {
        callback("please input where condition.", {});
        return;
      }
      for (let idx = 2; idx < length; idx++) {
        sql +=
          _whereList[idx].rel +
          " " +
          _whereList[idx].key +
          " " +
          _whereList[idx].op +
          " " +
          _whereList[idx].value +
          " ";
      }
    }
    if (_orderBy != "") {
      sql += "ORDER BY " + _orderBy.key + " " + _orderBy.rule + " ";
    }
    if (_limit != "") {
      sql += "LIMIT " + _limit + " ";
    }
    sql += ";";
    //还原配置
    this.deleteAllSet();

    //数据库连接 返回取出数据
    async.series(
      [
        function (asyncCallback) {
          fs.readFile(configPath, (err, data) => {
            _connectConfig = JSON.parse(data);
            asyncCallback(null, "success");
          });
        },
        function (asyncCallback) {
          _conn = mysql.createConnection(_connectConfig);
          _conn.query(sql, function (err, rows) {
            if (err) asyncCallback(err, "failed");
            else {
              _data = rows;
              asyncCallback(null, "success");
            }
          });
        },
      ],
      function (error, results) {
        _conn.end();
        if (error) callback(error, {});
        else callback(null, _data);
      },
    );
  };
  /**
   * delete语句
   * @param callback 回调函数
   */
  this.delete = (callback) => {
    let that = this;

    //校验
    let error = that.examine();
    if (error) {
      callback(error);
      return;
    }

    //构造sql
    let sql = "DELETE FROM " + _table + " WHERE ";
    if (_whereBinary === true) sql += "BINARY ";
    if (_whereList[0]["notUseArray"] === true) {
      sql += _whereStr + " ";
    } else {
      let length = _whereList.length;
      if (length > 1) {
        sql +=
          _whereList[1].key +
          " " +
          _whereList[1].op +
          " " +
          _whereList[1].value +
          " ";
      } else {
        callback("please input where condition.");
      }
      for (let idx = 2; idx < length; idx++) {
        sql +=
          _whereList[idx].rel +
          " " +
          _whereList[idx].key +
          " " +
          _whereList[idx].op +
          " " +
          _whereList[idx].value +
          " ";
      }
    }
    if (_orderBy != "") {
      sql += "ORDER BY " + _orderBy.key + " " + _orderBy.rule + " ";
    }
    if (_limit != "") {
      sql += "LIMIT " + _limit + " ";
    }
    sql += ";";

    //还原配置
    that.deleteAllSet();

    //数据库连接 删除数据
    async.series(
      [
        function (asyncCallback) {
          fs.readFile(configPath, (err, data) => {
            _connectConfig = JSON.parse(data);
            asyncCallback(null, "success");
          });
        },
        function (asyncCallback) {
          _conn = mysql.createConnection(_connectConfig);
          _conn.query(sql, function (err, rows) {
            if (err) asyncCallback(err, "failed");
            else asyncCallback(null, "success");
          });
        },
      ],
      function (error, results) {
        _conn.end();
        if (error) callback(error);
        else callback(null);
      },
    );
  };
  /**
   * update语句
   * @param callback 回调函数
   */
  this.update = (callback) => {
    let that = this;

    //校验
    let error = that.examine();
    if (error) {
      callback(error);
      return;
    }

    //构造sql
    let sql = "UPDATE " + _table + " SET ";
    let arrKey = Object.keys(_data);
    let arrKeyLength = arrKey.length;
    for (let idx = 0; idx < arrKeyLength - 1; idx++) {
      sql += arrKey[idx] + " = " + _data[arrKey[idx]] + ", ";
    }
    sql +=
      arrKey[arrKeyLength - 1] +
      " = " +
      _data[arrKey[arrKeyLength - 1]] +
      " WHERE ";
    if (_whereBinary === true) sql += "BINARY ";
    if (_whereList[0]["notUseArray"] === true) {
      sql += _whereStr + " ";
    } else {
      let length = _whereList.length;
      if (length > 1) {
        sql +=
          _whereList[1].key +
          " " +
          _whereList[1].op +
          " " +
          _whereList[1].value +
          " ";
      } else {
        callback("please input where condition.");
      }
      for (let idx = 2; idx < length; idx++) {
        sql +=
          _whereList[idx].rel +
          " " +
          _whereList[idx].key +
          " " +
          _whereList[idx].op +
          " " +
          _whereList[idx].value +
          " ";
      }
    }
    if (_orderBy != "") {
      sql += "ORDER BY " + _orderBy.key + " " + _orderBy.rule + " ";
    }
    if (_limit != "") {
      sql += "LIMIT " + _limit + " ";
    }
    sql += ";";

    //还原配置
    that.deleteAllSet();

    //数据库连接 更新数据
    async.series(
      [
        function (asyncCallback) {
          fs.readFile(configPath, (err, data) => {
            _connectConfig = JSON.parse(data);
            asyncCallback(null, "success");
          });
        },
        function (asyncCallback) {
          _conn = mysql.createConnection(_connectConfig);
          _conn.query(sql, function (err, rows) {
            if (err) asyncCallback(err, "failed");
            else asyncCallback(null, "success");
          });
        },
      ],
      function (error, results) {
        _conn.end();
        if (error) callback(error);
        else callback(null);
      },
    );
  };
}
let form = function (table = "", data = "") {
  let sqlObj = new sql(table, data);
  return sqlObj;
};
/**
 * 重新设置配置
 * @param newPath 新路径(按照这个自动构建文件来)
 */

let setConfigPath = function (newPath) {
  configPath = newPath;
};
exports.setConfigPath = setConfigPath;
exports.form = form;
