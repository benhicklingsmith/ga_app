$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
    //possibly unnessacary? might be useful for mobile devices? unknown. Remove if no use is found. ben 15/3
//    $('#otherCategory').on("change keyup paste", function () {
//        setFaultType('other');
//    });
});

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
        checkStaffID();
        // switchPages function temporary
        //switchPages("login", "options");
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

//used by login page to get the server to query postgres for the staff 
//when the staff id is provided
function checkStaffID() {
    var userID = $("#idInputBox").val();
    if (userID === "") {
        console.log("invalid user id")
        $(".issue").addClass("show");
    } else {
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
                alert("there has been an issue contacting the server.");
                console.log("error");
            }
        });
    }
}

//used by rf page 1
//querys server/database for valid carriage number before proceeding. 
function getCarriageDetails() {
    var carriageNo = $("#carNum").val();
    if (carriageNo === "") {
        console.log("invalid carriage id")
        $(".issue").addClass("show");
    } else {
        var json = JSON.stringify(carriageNo);
        var output = {};
        $.ajax({
            url: "http://localhost:8081/get_carriage_details",
            type: "POST",
            data: json,
            success: function (rt) {
                output = JSON.parse(rt)[0];
                var carExists = output.car_exists;
                if (carExists) {
                    localStorage.setItem("carDetails", JSON.stringify(output));
                }
                checkCar(carExists);
            },
            error: function () {
                alert("there has been an error contacting the server");
                console.log("error");
            }
        });
    }
}

// Run this function on success of AJAX and pass it the outcome:
// - if the carriage number exists set the local storage, remove any previous issue messages, set the
//  switchPages function for the next button, set the fault options available to the user in step 2 and set 
//  the location input of step 4
// - if the carriage number doesn't exist it displays 'can't find carriage number' message
function checkCar(carExists) {
    // temp carExists variable
    //var carExists = true;
    if (carExists) {
        console.log('firing');
        //create local storage objects
        var carDetails = new Object();
        carDetails.seats = 0;
        carDetails.toilet = false;
        carDetails.displayPanel = true;
        carDetails.socket = true;
        carDetails.wifi = false;
        
        var reportFault = new Object();
        reportFault.carriage = $('#carNum').val();
        
        localStorage.setItem("carDetails", JSON.stringify(carDetails));
        localStorage.setItem('reportFault', JSON.stringify(reportFault));
        
        //remove error message incase it shows from previous request.
        $(".issue").removeClass("show");
        
        //prepares step 4. changes the output dependent on whether the carriage has seats or not. 
        if (carDetails.seats > 0) {
            $("#region").removeClass("show");
            $("#seats").addClass("show");
        } else {
            $("#region").addClass("show");
            $("#seats").removeClass("show");
        }

        //$(".faultOption").removeClass("hide");
        
        //loops through all the carriage details stored in local storage and if this class of carriage does 
        //not have the feature, then that category is removed from rf page 2 EXAMPLE: if the carriage has no plug 
        //sockets, the user will not be able to choose plug sockets as a category.
        for (var key in carDetails) {
            if (typeof carDetails[key] === "boolean") {
                if (!carDetails[key]) {
                    $("#" + key).addClass('hide');
                }
            }
        }
        
        //sets the layout of the categories in rf step 2. If there is an odd number the "other" button spans two
        //columns. If all 8 categories are available the buttons are made slightly smaller. 
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
        console.log("invalid");
        //displays error string on screen.
        $(".issue").addClass("show");
    }
}

// method to submit all of the data to the database at the end of the form
function submitForm() {
    var fault = new Object();
    var carDetails = JSON.parse(localStorage.getItem('carDetails'));
    var userID = JSON.parse(localStorage.getItem('userID'));
    fault.carriageNo = carDetails.carriage_no;
    fault.staffNo = userID;
    fault.category = null;
    fault.seatNo = null;
    fault.location = null;
    fault.description = null;
    // set fault object, here temporarily for testing but needs to be moved to some point earlier in the process
    var json = JSON.stringify(fault);
    $.ajax({
        url: "http://localhost:8081/submit_form",
        type: "POST",
        data: json,
        success: function () {
            console.log("success");
        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("error");
        }
    });
    // send fault object to server
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

function setFaultType(type) {
    $(".faultOption").removeClass("show");
    $("#" + type).addClass('show');

    if (type === 'other') {
        $("#otherCategory").addClass('show');
    } else {
        $("#otherCategory").removeClass('show');
    }


    var otherInput = $('#otherCategory').val();

    // set the fault locating method
    // set next button on click switchPages function
    
    //ben -> will : does this need changing eventually to force a user to add something?
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

// Called when the user selects 'Next'. Checks to ensure that an option has been selected in step 2 and if 'other' 
// is selected it checks to make sure a description is provided
function checkInput() {
    if ($('#other').hasClass('show') && $('#otherCategory').val() === '') {
        alert('Please enter a fault category');
    } else if ($('.faultOption.show').length === 0) {
        alert('Please select an fault category');
    }
}

function exampleDescription(detail){
    var description = $("#" + detail).text();
    $("#detailedDescription").text(description);
}