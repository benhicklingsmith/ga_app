/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

console.log("server running\n");

var http = require('http');

var user = 'student';
var host = '127.0.0.1';
var database = 'studentdb';
var password = 'dbpassword';
var port = 5432;

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
    const {Client} = require('pg');
    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
    console.log(connectionString);
    const client = new Client({
        connectionString: connectionString,
    });
    await client.connect();
    
    //set search path
    const sqlquery1 = "SET SEARCH_PATH TO studentdb, ga_app_test;";
    console.log(sqlquery1);
    const res2 = client.query(sqlquery1);

    switch (req.url) {
        case '/get_staff':
            if (req.method === 'POST') {
                console.log("data sent to server");
                req.on('data', async function (data) {
                    //convert incoming data 
                    //nb - currently no data being used so unnecassary step at the moment (ben 07/03)
                    console.log("unparsed data -  " + data);
                    var json = JSON.parse(data);
                    console.log("parsed data - " + json);
                    json = "done";
                    
                    //query database
                    const sqlQuery = "SELECT * FROM staff;";
                    console.log(sqlQuery)
                    const sqlQueryResult = await client.query(sqlQuery);
                    var result = sqlQueryResult.rows;
                    console.log(result);
                    
                    //prepare data in json format for transfer to front end
                    var json_res = JSON.stringify(result);
                    console.log(json_res);
                    res.end(json_res);
                });
            }
            break;
        default:
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('error');
    }
}).listen(8081); // listen to port 8081
