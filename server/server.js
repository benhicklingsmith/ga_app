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


/* Jasmine login */
//var user = 'postgres';
//var database = 'postgres';
//var password = 'password';

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
    const sqlquery1 = "SET SEARCH_PATH TO " +  /*(if uni computer)"studentdb, " + */ "studentdb, ga_app;";
    console.log(sqlquery1);
    const res2 = client.query(sqlquery1);

    var sqlQuery;

    switch (req.url) {
        case '/check_id':
            if (req.method === 'POST') {
                
                console.log("data sent to server");
                req.on('data', async function (data) {
                    //convert incoming data 
                    console.log("unparsed data -  " + data);
                    var json = JSON.parse(data);
                    console.log("parsed data - " + json);
                    
                    //check if staff id entered is in the database
                    sqlQuery = "SELECT * FROM check_ID("+ json + ");";
                    console.log(sqlQuery)
                    const sqlQueryResult = await client.query(sqlQuery);
                    var result = sqlQueryResult.rows;
                    
                    //prepare data in json format for transfer to front end
                    // returns boolean
                    var json_res = JSON.stringify(result);
                    console.log(json_res);
                    res.end(json_res);
                    // 
                });
            }
            break;
        case '/check_name':
            if (req.method == 'POST'){
                req.on('data', async function(data){
                    var json = JSON.parse(data);
                    sqlQuery = "";
                });
            }
            break;
        default:
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('error');
    }
}).listen(8081); // listen to port 8081
