let sqlClass = require("./index");

//default: ./connect.json
sqlClass.setConfigPath("./connect.json");

//for inserting
let sqlInsert = sqlClass.form("archives", {
  name: "testName",
  description: "testDescription",
  tags: "{}",
  series_id: 0,
  series_order: 0,
  filepath: "testFilepath",
  create_time: "2020-10-3 18:55:13",
});

//also like this
/*
sqlInsert.setTable("archives");
sqlInsert.setData({
    name: "testName",
    description: "testDescription",
    tags: "{}",
    series_id: 0,
    series_order: 0,
    filepath: "testFilepath",
    create_time: "2020-10-3 18:55:13",
});
*/

//to insert
sqlInsert.insert((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("insert success");
  }
});

//for selecting
let sqlSelect = sqlClass.form("archives");

//plus where
sqlSelect.where("name", "nAme").where("id", 7, ">").where("name", "%114514%", "LIKE", "or");

//if need more complex logical relation, can also use this
// sqlSelect.whereSetByStr("name NOT LIKE '%name%' AND (id < 7  OR id = 14)");

//if true, check the case (default: true)
sqlSelect.setBinary(true);

//change the order returned from mysql
sqlSelect.orderBy("id", "desc");

//limit the num returned from mysql
sqlSelect.limit(2);

//check the sql statement(auto-check in insert/delete/update/select)
let err = null;
if(err = sqlSelect.examine()){
    console.log(err);
}

//to select
sqlSelect.select((error, data) => {
    if(error) {
        console.log(error);
    } else {
        console.log(data);
    }
});

//for updating
let sqlUpdate = sqlClass.form("archives");

//conditions are also like select
sqlUpdate.where("id", 6);

//data is also like insert
sqlUpdate.setData({
    name: "testName",
    description: "testDescription",
    tags: "{}",
    series_id: 0,
    series_order: 0,
    filepath: "testFilepath",
    create_time: "2020-10-3 18:55:13",
});

//to update
sqlUpdate.update((err) => {
    if(err) console.log(err);
    else console.log("update success");
});

//for deleting
let sqlDelete = sqlClass.form("archives");

//conditions are also like select
sqlDelete.where("id", 5);

//to delete
sqlDelete.delete((err) => {
    if(err) console.log(err);
    else console.log("delete success");
});
