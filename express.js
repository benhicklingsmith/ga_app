var express = require('express');
var app = express();
var path = require('path');

console.log("server running \n");

//host details for the postres database listening on the default postgres port.
var host = '127.0.0.1';
var dbport = 5432;

//port that this server will listen on. 
var appport = 3000;

//information needed for the pg connection string.
/* uni login*/
var user = 'student';
var database = 'studentdb';
var password = 'dbpassword';
var searchPath = "studentdb, ga_app";

var client;

app.use(express.static('public'));

let url_logger = (req, res, next) => {
	console.log(req.url);
	next();
};

app.use(url_logger);

async function connectDB() {
	//connect to postgres db
	const { Client } = require('pg');
	const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + dbport + '/' + database + '';
	console.log(connectionString);
	client = new Client({
		connectionString: connectionString,
	});
	await client.connect();

	//set search path
	const sqlquery1 = "SET SEARCH_PATH TO " + searchPath;
	console.log(sqlquery1);
	const res2 = await client.query(sqlquery1);


}

// gets staff id from front end, checks if it's in the database and returns a boolean
app.post('/check_id', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
            sqlQuery = "SELECT * FROM check_ID($1);";
            values = [json];
			console.log(sqlQuery);
			const sqlQueryResult = await client.query(sqlQuery, values);
			result = sqlQueryResult.rows[0];

		}
		catch (err) {
			console.log(err);
			result = new Object();
			result.check_id = false;
		}
		var json_res = JSON.stringify(result);
		console.log(json_res);
		res.end(json_res);
	});
});

// checks staff id based on name and dob, either returns the staff id or returns false if not found
app.post('/check_staff', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		sqlQuery = "SELECT staffid FROM staff WHERE fname = '$1' AND sname = '$2' AND dob = '$3';";
        values = [json.fname, json.sname, json.dob];
        var result = new Object();
		try {
			const sqlQueryResult = await client.query(sqlQuery, values);
			result = sqlQueryResult.rows[0];
			if (!result) {
				result = new Object();
				result.staffid = false;
			}
		}
		catch (err) {
			result.staffid = false;
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

//gets a list of all currently reforted faults for a particular carriage. 
app.post('/get_carriage_details', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
            sqlQuery = "SELECT * FROM carriage_details($1);";
            values = [json];
			const sqlQueryResult2 = await client.query(sqlQuery, values);
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
});

//submits all the collected information about a fault. 
app.post('/submit_form', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

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
			const sqlQueryResult = await client.query(sqlQuery, values);
			console.log(sqlQueryResult);
			result = sqlQueryResult.rows[0];
			console.log(result);
			result.success = true;
		}
		catch (err) {
			console.log(err);
			result.success = false;
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

//gets all faults submitted by a particular user.
app.post('/get_users_faults', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
			sqlQuery = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault WHERE staffID = $1;";
            values = [json.userID];
            const sqlQueryResult = await client.query(sqlQuery, values);
			result = sqlQueryResult.rows;
		}
		catch (err) {
			result = new Object();
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

//retreives requested faults according to the filters provided.
app.post('/filter_faults', async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    res.setHeader('Access-Control-Allow-Origin', '*');

    await connectDB();

    var sqlQuery;

    //the following method pieces together an sql statement dependent on which filters the user has chosen
    req.on('data', async function (data) {
        var json = JSON.parse(data);
        var filters = json.filters;
        var result;
        var filterCount = 0;
        var values = [];
        sqlStatement = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault";
        for (var filter in filters) {
            if (filters[filter]) {
                if (filterCount == 0) {
                    sqlStatement += " WHERE";
                }
                else {
                    sqlStatement += ' AND';
                }
                sqlStatement += " " + filter + " = $" + (filterCount+1);
                values.push(filters[filter])
                filterCount += 1;
            }
        }
        sqlStatement += " ORDER BY datereported DESC, timeReported DESC LIMIT " + json.limit + ";";
        console.log(sqlStatement);
        try {
            const sqlQueryResult = await client.query(sqlStatement, values);
            result = sqlQueryResult.rows;
            console.log(result);
        }
        catch (err) {
            result = new Object();
        }
        var json_res = JSON.stringify(result);
        res.end(json_res);
    });
});

//selects all information about a particular fault
app.post('/get_fault', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		console.log(json);
        sqlStatement = "SELECT * FROM fault WHERE faultno = $1";
        values = [json];
		try {
			const sqlQueryResult = await client.query(sqlStatement, values);
			result = sqlQueryResult.rows;
		}
		catch (err) {
			console.log(err);
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

//changes the stats of a fault
app.post('/change_fault_status', async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    res.setHeader('Access-Control-Allow-Origin', '*');

    await connectDB();

    var sqlQuery;

    req.on('data', async function (data) {
        var result = new Object();
        var json = JSON.parse(data);
        console.log(json);
        if (json.status == 'I') {
            sqlStatement = 'SELECT * FROM assign_fault($1, $2);';
            values = [json.faultNo, json.staffID];
        }
        else {
            sqlStatement = 'UPDATE fault SET status = $1 where faultNo = $2;';
            values = [json.status, json.faultNo];
        }
        try {
            await client.query(sqlStatement, values);
            result.success = true;
        }
        catch (err) {
            console.log(err);
            result.success = false;
        }
        var json_res = JSON.stringify(result);
        res.end(json_res);
    });
});

//updates the status of a fault to completed. can probably be removed and replaced in the front end 
//with  /change_fault_status.
app.post('/complete_fault', async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    res.setHeader('Access-Control-Allow-Origin', '*');

    await connectDB();

    var sqlQuery;

    req.on('data', async function (data) {
        var result = new Object();
        var json = JSON.parse(data);
        console.log(json);
        sqlStatement = "UPDATE fault SET status = $1 where faultNo = $2;";
        values = [json.status, json.faultNo];
        try {
            await client.query(sqlStatement, values);
            result.success = true;
        }
        catch (err) {
            console.log(err);
            result.success = false;
        }
        var json_res = JSON.stringify(result);
        res.end(json_res);
    });
});

app.post('/get_assigned_faults', async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    res.setHeader('Access-Control-Allow-Origin', '*');

    await connectDB();

    var sqlQuery;

    req.on('data', async function (data) {
        var result;
        var json = JSON.parse(data);
        sqlStatement = 'SELECT * FROM fault WHERE assignedTo = $1  ORDER BY dateReported ASC;';
        values = [json.userID];
        console.log(sqlStatement);
        try {
            const SQLQueryResult = await client.query(sqlStatement, values);
            result = SQLQueryResult.rows;
        }
        catch (err) {
            result = new Object;
        }
        var json_res = JSON.stringify(result);
        res.end(json_res);
    });
});


app.post('/get_carriage_faults', async function (req, res) {
    console.log(req.url);
    console.log(req.method);

    res.setHeader('Access-Control-Allow-Origin', '*');

    await connectDB();

    var sqlQuery;

    req.on('data', async function (data) {
        var result;
        var json = JSON.parse(data);
        sqlStatement = "SELECT faultNo, carriageNo, category, location, faultDesc, dateReported FROM fault WHERE carriageno = $1 AND (status = 'I' OR status = 'R') ORDER BY dateReported ASC;";
        values = [json];
        try {
            const SQLQueryResult = await client.query(sqlStatement, values);
            result = SQLQueryResult.rows;
        }
        catch (err) {
            result = new Object;
        }
        var json_res = JSON.stringify(result);
        res.end(json_res);
    });
});


app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));

});

app.listen(appport);
