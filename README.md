# mysql-builder-plus

## INSTALL

```sh
npm i mysql-builder-plus
```

## USAGE

This package can build sql statement simply by json, and can set conditions by chain, and supports different databases.

> The example is in ***example.js***, or you can straightly browse the following.



> can use different databases for different sqlClasses using different configs

```js
let sqlClass = require("./index");
```
> default: `./connect.json`

```js
sqlClass.setConfigPath("./connect.json");
```

### insert

```js
let sqlInsert = sqlClass.form("archives", {
  name: "testName",
  description: "testDescription",
  tags: "{}",
  series_id: 0,
  series_order: 0,
  filepath: "testFilepath",
  create_time: "2020-10-3 18:55:13",
});
```

> also like this

```js
let sqlInsert = sqlClass.form();
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
```

> to insert

```js
sqlInsert.insert((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("insert success");
  }
});
```

### select

> plus conditions

```js
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
```

> to select

```js
sqlSelect.select((error, data) => {
    if(error) {
        console.log(error);
    } else {
        console.log(data);
    }
});
```

### update

```js
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
```

> to update

```js
sqlUpdate.update((err) => {
    if(err) console.log(err);
    else console.log("update success");
});
```

### delete

```js
let sqlDelete = sqlClass.form("archives");
//conditions are also like select
sqlDelete.where("id", 5);
```

> to delete

```js
sqlDelete.delete((err) => {
    if(err) console.log(err);
    else console.log("delete success");
});
```

## ABOUT ME

I'm just a green hand in node, writing this for try. If you have some advice or find some bug in this package, **welcome to contact me, thanks a lot!**

