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


// /* Jasmine login */
// var user = 'postgres';
// var database = 'postgres';
// var password = 'password';
// var searchPath = " ga_app;"

// the quick and dirty trick which prevents crashing.
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

http.createServer(async function (req, res) {
    console.log(req.url);
    console.log(req.method);
    console.log(this.address());
    
    // Website you wish to allow to connect
    // add this line to address the cross-domain XHR issue.
    res.setHeader('Access-Control-Allow-Origin', '*');

    //connect to postgres db
    const {Client} = require('pg');
    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
    console.log(connectionString);
    const client = new Client({
        connectionString: connectionString,
    });
    await client.connect();
    
    //set search path
    const sqlquery1 = "SET SEARCH_PATH TO " +  searchPath;
    const res2 = client.query(sqlquery1);

    var sqlQuery;

    switch (req.url) {
        case '/check_id':
            if (req.method === 'POST') {
                req.on('data', async function (data) {
                    var json = JSON.parse(data);
                    sqlQuery = "SELECT * FROM check_ID("+ json + ");";
                    const sqlQueryResult = await client.query(sqlQuery);
                    var result = sqlQueryResult.rows;
                    var json_res = JSON.stringify(result);
                    res.end(json_res); 
// gets staff id from front end, checks if it's in the database and returns a boolean
                });
            }
            break;
        case '/check_name':
            if (req.method == 'POST'){
                req.on('data', async function(data){
                    var json = JSON.parse(data);
                    sqlQuery = "";
// will check staff id based on name and dob, needs to be implemented
                });
            }
            break;
        case '/get_carriage_details':
            if (req.method == 'POST'){
                req.on('data', async function(data){
                    var json = JSON.parse(data);
                    sqlQuery = "SELECT * FROM car_exists(" + json + ");";
                    const sqlQueryResult = await client.query(sqlQuery);
                    var isValid = sqlQueryResult.rows[0].car_exists;
                    console.log(isValid);
                    var result;
                    if (isValid){
                        sqlQuery = "SELECT * FROM carriage_details(" + json + ");"
                        const sqlQueryResult2 = await client.query(sqlQuery);
                        result = sqlQueryResult2.rows;
                    }
                    else{
                        result = sqlQueryResult.rows;
                    }
                    var json_res = JSON.stringify(result);
                    console.log(result);
                    res.end(json_res);
                });
// checks if carriage number is in the database, returns boolean and if true also returns the carriage details
            }
            break;
        case 'submit_form':
            if (req.method == 'POST'){
                req.on('data', async function(data){
                    var json = JSON.parse(data);
                    sqlQuery = "SELECT * FROM insert_fault($1,$2,$3,$4,$5,$6)";
                    var values = [json.carriageNo, json.category, json.seatNo, json.location, json.description, json.staffNo];
                    const sqlQueryResult = await client.query(sqlQuery, values);
                    res.end();
                });
// enters fault details into database (sort of works)
            }
            break;
        default:
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('error');
    }
}).listen(8081); // listen to port 8081
