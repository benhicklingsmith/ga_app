$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
});

function setPath(path) {
    $("#pathBtn").removeAttr("onclick");
    $("#pathBtn").attr(
            "onclick",
            "switchPages('options', '" + path + "'); clearPath()"
            );
}

function clearPath() {
    $("#pathBtn").removeAttr("onclick");
}

function switchPages(from, to) {
    var classFrom = $("." + from);
    var classTo = $("." + to);

    setTimeout(function () {
        classFrom.removeClass("fade");
    }, 0);

    setTimeout(function () {
        classFrom.removeClass("current");
    }, 500);

    setTimeout(function () {
        classTo.addClass("current");
    }, 500);

    setTimeout(function () {
        classTo.addClass("fade");
    }, 1000);
}

function login(from) {
    if (from === "login") {
        // checkStaffID();
        // switchPages function temporary
        switchPages("login", "options");
    } else if (from === "findID") {
        // need to check staffID using name and ID
        // switchPages function temporary
        switchPages("findID", "options");
    }
}

function clearIssues() {
    setTimeout(function () {
        $(".issue").removeClass("show");
    }, 500);
}

// Run this function on success of AJAX and pass it the outcome:
// - first check whether the carriage number exists
// - if it does it sets the local storage, removes any previous issue messages
// - and sets the location input of step 4
// - if the carriage number doesn't exist it displays 'can't find carriage number' message
function checkCar(carExists) {
    // temp carExists variable
    var carExists = true;
    if (carExists) {
        var carDetails = new Object();
        carDetails.seats = 56;
        carDetails.wifi = true;
        carDetails.sockets = true;
        carDetails.displayPanel = true;
        carDetails.toilet = true;
        localStorage.setItem("carDetails", JSON.stringify(carDetails));
        $(".issue").removeClass("show");
        switchPages("rf-1", "rf-2");
        if (carDetails.seats > 0) {
            $("#region").removeClass("show");
            $("#seats").addClass("show");
        } else {
            $("#region").addClass("show");
            $("#seats").removeClass("show");
        }
    } else {
        $(".issue").addClass("show");
    }
}

function checkStaffID() {
    var userID = $("#idInputBox").val();
    var json = JSON.stringify(userID);
    var output = {};
    $.ajax({
        url: "http://localhost:8081/check_id",
        type: "POST",
        data: json,
        success: function (rt) {
            output = JSON.parse(rt)[0];
            var id_exists = output.check_id;
            if (id_exists) {
                localStorage.setItem("userID", userID);
                switchPages("login", "options");
            }
        },
        error: function () {
            console.log("error");
            //alert("error");
        }
    });
}

function typeNum(num) {
    //get the maximum seat capacity for the carriage from the object in  local storage
    var carriage = JSON.parse(localStorage.getItem('carDetails'));
    var maxSeats = carriage.seats;

    //calculate the seat number that the user is trying to input
    //get the current number shown on the screen
    var seatNoStr = $("#seatNo").text();
    var currentSeatStr = seatNoStr.split(": ").pop();
    
    //append new digit
    var newSeatStr = currentSeatStr + num;
    
    //parse to int to allow for comparison with max seat number
    var newSeatInt = parseInt(newSeatStr);

    //compare attempted input with max seat no. If new input is within valid range, 
    //continue and display new number. if the current string does not have any seat number,
    //do not delete anything. otherwise display error message.
    if (newSeatInt <= maxSeats) {
        console.log('valid seat');
        if (num === "-1" && seatNoStr !== 'Seat Number: ') {
            $("#seatNo").text(function (_, txt) {
                return txt.slice(0, -1);
            });
        } else if (num !== "-1") {
            $("#seatNo").append(num);
        }
    } else {
        console.log('seat number too large');
    }
}

function setFaultType(type) {
    $(".faultOption").removeClass("show");
    $("#" + type).addClass('show');
}