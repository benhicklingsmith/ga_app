$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
    $('#otherCategory').on("change keyup paste", function () {
        setFaultType('other');
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
// - if the carriage number exists set the local storage, remove any previous issue messages, set the switchPages function for the next button, set the fault options available to the user in step 2 and set the location input of step 4
// - if the carriage number doesn't exist it displays 'can't find carriage number' message
function checkCar(carExists) {
    // temp carExists variable
    var carExists = true;
    if (carExists) {
        var carDetails = new Object();
        var reportFault = new Object();
        carDetails.seats = 0;
        carDetails.toilet = true;
        carDetails.displayPanel = true;
        carDetails.socket = true;
        carDetails.wifi = false;
        reportFault.carriage = $('#carNum').val();
        localStorage.setItem("carDetails", JSON.stringify(carDetails));
        localStorage.setItem('reportFault', JSON.stringify(reportFault));

        $(".issue").removeClass("show");

        if (carDetails.seats > 0) {
            $("#region").removeClass("show");
            $("#seats").addClass("show");
        } else {
            $("#region").addClass("show");
            $("#seats").removeClass("show");
        }
        $(".faultOption").removeClass("hide");
        for (var key in carDetails) {
            if (typeof carDetails[key] === "boolean") {
                if (!carDetails[key]) {
                    $("#" + key).addClass('hide');
                }
            }
        }

        var hiddenOptions = $('.faultOption.hide').length;
        var totalOptions = $('.faultOptions').children().length;
        var options = totalOptions - hiddenOptions;
        var optionParity = options % 2;

        if (options > 6) {
            $('.faultOption').css("height", "50px");
        }

        if (optionParity === 1) {
            $('#other').css("grid-column", "span 2");
        }

        switchPages("rf-1", "rf-2");

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

// Called when the user selects any fault option button or when any change is made to the description panel. Removes show class from all fault options and adds a show class to the selected button (used to change the css). If the selected button is not other, or it is other and the description is not empty, then set the switchPage function for the next button. If other is selected and input is empty reset the onlclick function of the rf-2Next to checkInput

function setFaultType(type) {
    $(".faultOption").removeClass("show");
    $("#" + type).addClass('show');

    if (type === 'other') {
        $("#otherCategory").addClass('show');
    }
    else {
        $("#otherCategory").removeClass('show');
    }


    var otherInput = $('#otherCategory').val();

    // set the fault locating method
    // set next button on click switchPages function
    if (type !== "other" || (type === 'other' && otherInput !== '')) {
        $("#rf-2Next").attr(
            "onclick",
            "checkInput(); switchPages('rf-2', 'rf-3')"
        );
    } else if (type === 'other') {
        $('#rf-2Next').removeAttr('onlick');
        $("#rf-2Next").attr(
            "onclick",
            "checkInput()"
        );
    }
}

// Called when the user selects 'Next'. Checks to ensure that an option has been selected in step 2 and if 'other' is selected it checks to make sure a description is provided
function checkInput() {
    if ($('#other').hasClass('show') && $('#otherCategory').val() === '') {
        alert('Please enter a fault category');
    } else if ($('.faultOption.show').length === 0) {
        alert('Please select an fault category');
    }
}