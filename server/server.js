/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

console.log("server running\n");

var http = require('http');

var host = '127.0.0.1';
var port = 5432;

/* uni login*/
  var user = 'student';
  var database = 'studentdb';
  var password = 'dbpassword';
  var searchPath = "studentdb, ga_app;"


/* Jasmine login */
//var user = 'postgres';
//var database = 'postgres';
//var password = 'password';
//var searchPath = " ga_app;";

/* Will login */
//var user = 'postgres';
//var database = 'projects';
//var password = 'password';
//var searchPath = "projects, ga_app;";

/* ben login */
//var user = 'postgres';
//var database = 'category';
//var password = 'dbpassword';
//var searchPath = "categories, coursework_schema;";

// the quick and dirty trick which prevents crashing.
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

http.createServer(async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    // Website you wish to allow to connect
    // add this line to address the cross-domain XHR issue.
    res.setHeader('Access-Control-Allow-Origin', '*');

    //connect to postgres db
    const { Client } = require('pg');
    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
    console.log(connectionString);
    const client = new Client({
        connectionString: connectionString,
    });
    await client.connect();

    //set search path
    const sqlquery1 = "SET SEARCH_PATH TO " + searchPath;
    const res2 = client.query(sqlquery1);

    var sqlQuery;

    switch (req.url) {
        case '/check_id':
            if (req.method === 'POST') {
                req.on('data', async function (data) {
                    var json = JSON.parse(data);
                    var result;
                    try {
                        sqlQuery = "SELECT * FROM check_ID(" + json + ");";
                        const sqlQueryResult = await client.query(sqlQuery);
                        result = sqlQueryResult.rows[0];

                    }
                    catch (err) {
                        result = new Object();
                        result.check_id = false;
                    }
                    var json_res = JSON.stringify(result);
                    console.log(json_res);
                    res.end(json_res);
                    // gets staff id from front end, checks if it's in the database and returns a boolean

                });
            }
            break;
        case '/check_staff':
            if (req.method == 'POST') {
                req.on('data', async function (data) {
                    var json = JSON.parse(data);
                    sqlQuery = "SELECT staffid FROM staff WHERE fname = $1 AND sname = $2 AND dob = $3;";
                    var values = [json.fname, json.sname, json.dob];
                    var result;
                    try {
                        const sqlQueryResult = await client.query(sqlQuery, values);
                        result = sqlQueryResult.rows;
                    }
                    catch (err) {
                        result = new Object();
                        result.staffid = false;
                    }
                    var json_res = JSON.stringify(result);
                    res.end(json_res);
                    // checks staff id based on name and dob, either returns the staff id or returns false if not found
                });
            }
            break;
        case '/get_carriage_details':
            if (req.method == 'POST') {
                req.on('data', async function (data) {
                    var json = JSON.parse(data);
                    var result;
                    try {
                        sqlQuery = "SELECT * FROM carriage_details(" + json + ");"
                        const sqlQueryResult2 = await client.query(sqlQuery);
                        result = sqlQueryResult2.rows[0];
                        console.log(result);
                    }
                    catch (err) {
                        result = new Object();
                        result.car_exists = false;
                    }
                    var json_res = JSON.stringify(result);
                    res.end(json_res);
                });
                // checks if carriage number is in the database, returns boolean and if true also returns the carriage details
            }
            break;
        case '/submit_form':
            if (req.method == 'POST') {
                var body = '';
                req.on('data', function (data) {
                    console.log(data);
                    body += data;
                    console.log("Body: " + body);
                });
                req.on('end', async function () {
                    var result = new Object();
                    
                    try {
                        var json = JSON.parse(body);
                        console.log(json);
                        sqlQuery = "SELECT * FROM insert_fault($1,$2,$3,$4,$5,$6)";
                        var values = [json.carriage, json.category, json.location, json.description, json.userID, json.img];
                        sqlQuery = "SELECT * FROM insert_fault(" + json.carriage + ", '" + json.category + "', '" + json.location + "', '" + json.description + "', " + json.userID + ", '" + json.img + "');";
                        console.log(sqlQuery);
                        //console.log(values);
                        const sqlQueryResult = await client.query(sqlQuery);
                        console.log(sqlQueryResult);
                        result.success = true;
                    }
                    catch (err) {
                        console.log(err);
                        result.success = false;
                    }
                    var json_res = JSON.stringify(result);
                    console.log(result);
                    res.end(json_res);
                });
                // enters fault details into database 
            }
            break;
        case '/show_image':
            if(req.method === 'POST'){
                req.on('data', async function (data) {
                
                sqlQuery = "select * from fault where faultno = 25;"
                const sqlQueryResult = await client.query(sqlQuery);
                
                result = sqlQueryResult.rows;
                
                var json_res = JSON.stringify(result);
                console.log(result);
                res.end(json_res);
                });
            }
            break;
            case '/get_users_faults':
            if (req.method === 'POST'){
                req.on('data', async function (data){
                    var json = JSON.parse(data);
                    var result;
                    try{
                        sqlQuery = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault WHERE staffID = " + json.userID + ";";
                        const sqlQueryResult = await client.query(sqlQuery);
                        result = sqlQueryResult.rows;
                    }
                    catch(err){
                        result = new Object();
                    }
                    var json_res = JSON.stringify(result);
                    res.end(json_res);
                });
            }
            break;
    case '/filter_faults':
        if(req.method === 'POST'){
            req.on('data', async function (data){
                var json = JSON.parse(data);
                var result;
                var filterCount = 0;
                sqlStatement = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault";
                for (var filter in json){
                        if (filterCount == 0){
                            sqlStatement += " WHERE";
                        }
                        if (filterCount >= 1){
                            sqlStatement += ' AND';
                        }
                        sqlStatement += " " + filter + " = " + json[filter];
                        filterCount += 1;
                    }
                sqlStatement += " ORDER BY datereported;";
                console.log(sqlStatement);
                try{
                    const sqlQueryResult = await client.query(sqlStatement);
                    result = sqlQueryResult.rows;
                    console.log(result);

                }
                catch(err){
                    console.log(err);
                }
            });
        }
        break;
        default:
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('error');
    }
}).listen(8081); // listen to port 8081
