$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
    //possibly unnessacary? might be useful for mobile devices? unknown. Remove if no use is found. ben 15/3
    //    $('#otherCategory').on("change keyup paste", function () {
    //        setFaultType('other');
    //    });
});

//object of objects that can be used to populate 
var faultCategories = {
    wifi: {
        example_1: "slow connection",
        example_2: "can't connect",
        example_3: "cannot find wifi"
    },
    toilet: {
        example_1: "toilet won't flush",
        example_2: "sink doesn't work",
        example_3: "no toilet paper"
    },
    HVAC: {
        example_1: "carriage too hot",
        example_2: "carriage too cold"
    },
    door: {
        example_1: "outer door broken",
        example_2: "inside door won't open",
        example_3: "inside door won't shut",
        example_4: "inside door reaction slow"
    },
    window: {
        example_1: "window scratched",
        example_2: "window cracked",
        example_3: "window too dirty"
    },
    seat: {
        example_1: "example",
        example_2: "example",
        example_3: "example"
    },
    table: {
        example_1: "example",
        example_2: "example",
        example_3: "example"
    },
};

var noLocationFaults = ['wifi', 'toilet', 'displayPanel', 'HVAC', 'door'];

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
        checkStaffID();
        // switchPages function temporary
        //switchPages("login", "options");
    } else if (from === "findID") {
        // need to check staffID using name and ID
        // switchPages function temporary
        //switchPages("findID", "options");
        checkStaffDetails();
    }
}

function clearIssues() {
    setTimeout(function () {
        $(".issue").removeClass("show");
    }, 500);
}

//used by login page to get the server to query postgres for the staff 
//when the staff id is provided
function checkStaffID() {
    var userID = $("#idInputBox").val();
    if (userID === "") {
        console.log("invalid user id");
        $("#invalidStaffId").addClass("show");
    } else {
        var json = JSON.stringify(userID);
        var output = {};
        $.ajax({
            url: "http://localhost:8081/check_id",
            type: "POST",
            data: json,
            success: function (rt) {
                output = JSON.parse(rt);
                console.log(output.check_id);
                var id_exists = output.check_id;
                if (id_exists) {
                    var userDetails = new Object();
                    userDetails.userID = userID;
                    localStorage.setItem("userDetails", JSON.stringify(userDetails));
                    switchPages("login", "options");
                } else {
                    console.log("invalid user id");
                    $("#invalidStaffId").addClass("show");
                }
            },
            error: function () {
                alert("there has been an issue contacting the server.");
                console.log("error");
            }
        });
    }
}

function setPageElements() {

    // removes any error message shown from previous request.
    $(".issue").removeClass("show");

    var carDetails = JSON.parse(localStorage.getItem("carDetails"));

    // set page 2 options by iterating through features found in carriage and setting them to show

    $('.faultOption').removeClass('hide');

    for (var key in carDetails) {
        if (typeof carDetails[key] === "boolean") {
            if (!carDetails[key]) {
                $("#" + key).addClass('hide');
            }
        }
    }

    // set page 2 button height and span depending on number and parity of buttons

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


    // set page 4 location input method

    if (carDetails.seats > 0) {
        $("#region").removeClass("show");
        $("#seats").addClass("show");
    } else {
        $("#region").addClass("show");
        $("#seats").removeClass("show");
    }


}

function setLocalStorage() {
    var userDetails = JSON.parse(localStorage.getItem("userDetails"));
    var reportFault = new Object();
    reportFault.user = userDetails.userID;
    reportFault.carriage = $('#carNum').val();
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function checkStaffDetails() {
    var staffDetails = new Object();
    staffDetails.fname = $("#fname").val();
    staffDetails.sname = $("#sname").val();
    staffDetails.dob = $("#dob").val();
    var json = JSON.stringify(staffDetails);
    $.ajax({
        url: "http://localhost:8081/check_staff",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
            output = JSON.parse(rt);
            console.log(output);
            if (output.staffid != false) {
                var userDetails = new Object();
                userDetails.userID = output.staffid;
                localStorage.setItem("userDetails", JSON.stringify(userDetails));
                switchPages("findID", "options");
            } else {
                console.log("no id found");
            }
        },
        error: function () {
            console.log("error");
        }
    });
}

//used by rf page 1
//querys server/database for valid carriage number before proceeding. 
function getCarriageDetails() {
    var carriageNo = $("#carNum").val();
    if (carriageNo === "") {
        console.log("invalid - no carriage number provided");
        $("#invalidCarriageId").addClass("show");
    } else {
        var json = JSON.stringify(carriageNo);
        var output = {};
        $.ajax({
            url: "http://localhost:8081/get_carriage_details",
            type: "POST",
            data: json,
            success: function (rt) {
                output = JSON.parse(rt);
                if (output.car_exists) {
                    localStorage.setItem("carDetails", JSON.stringify(output));
                    setLocalStorage()
                    setPageElements();
                    switchPages('rf-1', 'rf-2');
                } else {
                    console.log("invalid - carriage id does not exist");
                    $("#invalidCarriageId").addClass("show");
                }
            },
            error: function () {
                console.log("error");
                alert("there has been an error contacting the server");
            }
        });
    }
}

// method to submit all of the data to the database at the end of the form
function submitForm() {
    // method to submit all of the data to the database at the end of the form
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    var userDetails = JSON.parse(localStorage.getItem('userDetails'));
    reportFault.userID = userDetails.userID;
    var json = JSON.stringify(reportFault);
    $.ajax({
        url: "http://localhost:8081/submit_form",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
            console.log("data submitted");
        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("data not submitted");
        }
    });
    // send fault object to server
}

function storeDescription() {
    var description = $('#description').val();
    if (description != "description") {
        var reportFault = JSON.parse(localStorage.getItem('reportFault'));
        reportFault.description = description;
        localStorage.setItem('reportFault', JSON.stringify(reportFault));
    }
}

function typeNum(num) {
    //get the maximum seat capacity for the carriage from the object in  local storage
    var carriage = JSON.parse(localStorage.getItem('carDetails'));
    var maxSeats = carriage.seats;

    //get the current number shown on the screen. second line removes the prepended text
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

// Called when the user selects any fault option button or when any change is made to the description panel. 
// Removes show class from all fault options and adds a show class to the selected button (used to change the css).
// If the selected button is not other, or it is other and the description is not empty, then set the switchPage 
// function for the next button. If other is selected and input is empty reset the onlclick function of the rf-2Next to 
// checkInput

function selectFault(type) {

    $(".faultOption").removeClass("show");
    $("#" + type).addClass('show');

    if (type === 'other') {
        $("#otherCategory").addClass('show');
    } else {
        $("#otherCategory").removeClass('show');
    }

}


// Called when the user selects 'Next'. Checks to ensure that an option has been selected in step 2 and if 'other' 
// is selected it checks to make sure a description is provided
function checkInput(page) {

    switch (page) {

        case 'rf-1':

            getCarriageDetails();
            break;

        case 'rf-2':

            var selectedFault = $('.faultOption.show').attr("id");
            var otherInput = $('#otherCategory').val();

            if (selectedFault !== 'other' && selectedFault != null) {

                removeFaultDetails('location');

                if (noLocationFaults.includes(selectedFault)) {
                    addFaultDetails('location', selectedFault);
                    $("#rf-3Next").attr("onclick", "switchPages('rf-3', 'rf-5')");
                    $("#rf-5Back").attr("onclick", "switchPages('rf-5', 'rf-3')");
                } else {
                    removeFaultDetails('faultCategory');
                    ("#rf-3Next").attr("onclick", "switchPages('rf-3', 'rf-4')");
                    $("#rf-5Back").attr("onclick", "switchPages('rf-4', 'rf-3')");
                }

                addFaultDetails('faultCategory', selectedFault);
                switchPages('rf-2', 'rf-3');

            } else if (selectedFault === 'other' && otherInput !== '') {
                addFaultDetails('faultCategory', otherInput);
                switchPages('rf-2', 'rf-3');
            } else if (selectedFault == null) {
                alert('Please select a fault category');
            } else if (selectedFault === 'other' && otherInput === '') {
                alert('Please enter a fault category description');
            }

            break;

        case 'rf-3':

            // if fault details contains a location switch pages from rf-3 to rf-4
            // if it doesn't switch pages from rf-3 to rf-5

            break;

        case 'rf-4':

            if ($('.faultLocator.seats.show').length === 1) {
                var seatNo = $('#seatNo').text();
                if (seatNo > 0) {
                    var seatNoStr = 'seat ' + seatNo;
                    addFaultDetails('location', seatNoStr);
                    switchPages('rf-4', 'rf-5');
                } else {
                    alert('Please enter a valid seat number');
                    break;
                }
            } else if ($('.faultLocator.region.show').length === 1) {
                // repeat something similar to above but for faults located using region
            }

            var reportFault = JSON.parse(localStorage.getItem('reportFault'));

            for (var key in reportFault) {
                switch (key) {

                    case 'carriage':
                        $("#sumCarNo").empty();
                        $("#sumCarNo").text(reportFault[key]);
                        break;
                    case 'faultCategory':
                        $("#sumCat").empty();
                        $("#sumCat").text(reportFault[key].charAt(0).toUpperCase() + reportFault[key].slice(1));
                        break;
                    case 'description':
                        $("#sumDes").empty();
                        $("#sumDes").text(reportFault[key].charAt(0).toUpperCase() + reportFault[key].slice(1));
                        break;
                    case 'location':
                        $("#sumLoc").empty();
                        $("#sumLoc").text(reportFault[key].charAt(0).toUpperCase() + reportFault[key].slice(1));
                        break;
                }

            }









            break;

        case 'rf-5':

            break;

        case 'rf-6':

            break;


    }

}

function addFaultDetails(key, value) {
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    reportFault[key] = value;
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function removeFaultDetails(key) {
    var reportFault = JSON.parse(localStorage.getItem('reportFault'));
    delete reportFault[key];
    localStorage.setItem('reportFault', JSON.stringify(reportFault));
}

function exampleDescription(detail) {
    var description = $("#" + detail).text();
    $("#detailedDescription").text(description);
}