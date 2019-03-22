$(function () {
    document.getElementById("cantFindID").addEventListener("click", function () {
        switchPages("login", "findID");
    });
    document.getElementById("selectPic").addEventListener("change", setFaultImage, false);
    //possibly unnessacary? might be useful for mobile devices? unknown. Remove if no use is found. ben 15/3
    //    $('#otherCategory').on("change keyup paste", function () {
    //        setFaultType('other');
    //    });
});

$(function () {
    switchPages("rf-4","login");
});

//object of objects that can be used to populate 
var faultCategories = {
    wifi: {
        name: 'wifi',
        example_1: "Slow connection",
        example_2: "Cannot connect",
        example_3: "Cannot find wifi"
    },
    toilet: {
        name: 'toilet',
        example_1: "Toilet does not flush",
        example_2: "Sink does not work",
        example_3: "No toilet paper"
    },
    HVAC: {
        example_1: "Carriage too hot",
        example_2: "Carriage too cold",
        example_3: "Air smells weird"
    },
    door: {
        example_1: "Door will not open",
        example_2: "Door will not shut",
        example_3: "Door reaction slow"
    },
    window: {
        example_1: "Window scratched",
        example_2: "Window cracked",
        example_3: "Window too dirty"
    },
    seat: {
        example_1: "Seat dirty",
        example_2: "Hole in seat",
        example_3: "Ajoined table broken"
    },
    socket: {
        example_1: "Not charging",
        example_2: "Something stuck in socket",
        example_3: "Socket loose from wall"
    },
    displayPanel: {
        example_1: "Leds broken",
        example_2: "Not on",
        example_3: "Displaying wrong or old info"
    }
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

    // set all fault options to original state by removing hide class
    $('.faultOption').removeClass('hide');

    // iterate through carDetails object and if the value is of type boolean and it is false add hide class
    for (var key in carDetails) {
        if (typeof carDetails[key] === "boolean" && !carDetails[key]) {
            $("#" + key).addClass('hide');
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
            if (output.staffid !== false) {
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
                    setLocalStorage();
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
    console.log(reportFault);
    var json = JSON.stringify(reportFault);
    console.log(json);
    $.ajax({
        url: "http://localhost:8081/submit_form",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(rt);
            console.log("data submitted");
            var returnedData = JSON.parse(rt);
            if (returnedData.success) {
                localStorage.removeItem('reportFault');
            }
        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("data not submitted");
        }
    });
    // send fault object to server
}

function getUsersFaults(){
    var userDetails = localStorage.getItem('userDetails');
    $.ajax({
        url: "http://localhost:8081/get_users_faults",
        type: "POST",
        data: userDetails,
        success: function (rt) {
            
            var userFaults = JSON.parse(rt);
            console.log(userFaults);
            
            localStorage.setItem('userFaults', rt);
            //$('#viewUserFaults').empty();
            for(var i = 0; i < userFaults.length; i++){
                console.log("fault to be displayed - " + i);
                
                $('#viewUserFaults').append("<a class='faultView' onclick='viewFaultDetails(" + i + ")'>"
                       +  "<h3>" + userFaults[i].carriageno + " - " + userFaults[i].category + " </h3>"
                       + "<h4>" + userFaults[i].faultdesc + " </h4>"
                    + "</a>");
            }
        },
        error: function () {
            console.log("error - ");
        }   
     })
}
// gets all faults reported by the user 
// returns an array of objects with each fault as an object

function viewFaultDetails(i){
    var userFaults = localStorage.getItem('userFaults');
    var fault = userFaults[i];
    
    $('#detCarNo').text(fault.carriageno);
    $('#detCat').text(fault.category);
    $('#detDes').text(fault.faultdesc);
    $('#detLoc').text(fault.location);
    switchPages('vf-1', 'vf-2');
}

function filterFaults(){
    var filters = new Object();
    filters.category = "wifi";
    filters.carriageNo = 12345;
    filters.status = 'N';
    var json = JSON.stringify(filters);
    $.ajax({
        url: "http://localhost:8081/filter_faults",
        type: "POST",
        data: json,
        success: function (rt) {
            console.log(JSON.parse(rt));
        },
        error: function () {
            console.log("error")
        }   
     })
}

function typeNum(num) {
    //get the maximum seat capacity for the carriage from the object in  local storage
    var carriage = JSON.parse(localStorage.getItem('carDetails'));
    var maxSeats = carriage.seats;

    //get the current number shown on the screen. second line removes the prepended text
    var seatNoStr = $("#seatNo").text();
    console.log(seatNoStr);
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
        if (num === "-1") {
            $("#seatNo").text(function (_, txt) {
                return txt.slice(0, -1);
            });
        } else if (num === '0') {
            if (seatNoStr !== '') {
                $("#seatNo").append(num);
            }
        } else {
            $("#seatNo").append(num);
        }
    } else {
        $("#seatNoIssueMsg").text("Seat number too large");
        $("#invalidSeatNo").addClass("show");
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
        $('.section.rf-2').animate({scrollTop: $('.section.rf-2')[0].scrollHeight}, 2000);
    } else {
        $("#otherCategory").removeClass('show');
    }

}

// Called when the user selects 'Next'. Checks to ensure that an option has been selected in step 2 and if 'other' 
// is selected it checks to make sure a description is provided
function checkInput(page) {

    var reportFault = JSON.parse(localStorage.getItem('reportFault'));

    switch (page) {

        case 'rf-1':

            getCarriageDetails();
            break;

        case 'rf-2':

            var selectedFault = $('.faultOption.show').attr("id");
            var otherInput = $('#otherCategory').val();
            console.log(selectedFault);
            switch (selectedFault) {
                case 'wifi':
                    requiresImage(false);
                    step2ToStep3(selectedFault);
                    break;
                case 'toilet':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'HVAC':
                    requiresImage(false);
                    step2ToStep3(selectedFault);
                    break;
                case 'door':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'window':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'seat':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'socket':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'displayPanel':
                    requiresImage(true);
                    step2ToStep3(selectedFault);
                    break;
                case 'other':
                    requiresImage(true);
                    addFaultDetails('category', otherInput);
                    switchPages('rf-2', 'rf-3');
                    break;
                default:
                    //nothing selected.
                    if (selectedFault === undefined) {
                        alert('Please select a fault category');
                    } else if (selectedFault === 'other' && otherInput === '') {
                        alert('Please enter a fault category description');
                    }
            }

            break;

        case 'rf-3':

            var carDetails = JSON.parse(localStorage.getItem("carDetails"));

            // add fault description to reportFault in local storage

            var description = $('#description').val();

            if (description !== '') {
                addFaultDetails('description', description);
            } else {
                addFaultDetails('description', 'no input');
            }

            // if the location doesn't require a specific location (see global variable noLocationFaults) then bypass page 4
            // else set the fault location method in page 4 depending on seats

            $("#region").removeClass("show");
            $("#seats").removeClass("show");

            if (noLocationFaults.includes(reportFault.location)) {
                setSummaryPage();
                switchPages('rf-3', 'rf-5');
            } else {
                // set page 4 location input method
                if (carDetails.seats > 0) {
                    var carriage = JSON.parse(localStorage.getItem('carDetails'));
                    var maxSeats = carriage.seats;
                    $("#seats").addClass("show");
                    $("#maxSeatNo").text(maxSeats);
                } else {
                    $("#region").addClass("show");
                }
                switchPages('rf-3', 'rf-4');
            }

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

            setSummaryPage();
            break;

        case 'rf-5':

            break;

        case 'rf-6':

            break;


    }

}

//function added by ben.
//used when transitioning from rf page 2 to rf page 3 
function step2ToStep3(selectedFault) {
    if (noLocationFaults.includes(selectedFault)) {
        addFaultDetails('location', selectedFault);
    }

    //set up the detailed description examples on the next page
    console.log(selectedFault);
    $("#example_1").text(faultCategories[selectedFault].example_1);
    $("#example_2").text(faultCategories[selectedFault].example_2);
    $("#example_3").text(faultCategories[selectedFault].example_3);

    addFaultDetails('category', selectedFault);
    switchPages('rf-2', 'rf-3');
}

//function added by ben.
//used when transitioning from rf page 2 to rf page 3 
//called with true if a category requires a photo to be added when on rf page 3
//called with false if not
function requiresImage(bool) {
    if (bool) {
        $('#addPhoto').addClass("show");
    } else {
        $('#addPhoto').removeClass("show");
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
    $("#description").val(description);
}

function storeDescription() {
    var description = $('#description').val();
    if (description !== "description") {
        var reportFault = JSON.parse(localStorage.getItem('reportFault'));
        reportFault.description = description;
        localStorage.setItem('reportFault', JSON.stringify(reportFault));
    }
}

function back(page) {
    switch (page) {
        case 'rf-2':
            // empty local storage
            localStorage.removeItem('carDetails');
            localStorage.removeItem('reportFault');
            switchPages('rf-2', 'rf-1');
            break;
        case 'rf-3':
            // remove location and fault category from reportFault in local storage
            removeFaultDetails('location');
            removeFaultDetails('category');
            switchPages('rf-3', 'rf-2');
            break;
        case 'rf-4':
            // remove fault description
            removeFaultDetails('description');
            switchPages('rf-4', 'rf-3');
            break;

        case 'rf-5':
            // if a fault location method is not set in step 4 then remove description from reportFault in local storage and switch page to page 3
            // else remove location from report in local storage and switch page to page 4
            var seatsActive = $('.faultLocator.seats.show').length;
            var regionActive = $('.faultLocator.region.show').length;
            if (seatsActive === 0 && regionActive === 0) {
                removeFaultDetails('description');
                switchPages('rf-5', 'rf-3');
            } else {
                removeFaultDetails('location');
                switchPages('rf-5', 'rf-4');
            }
            break;
    }
}

function setSummaryPage() {

    var reportFaultDetails = JSON.parse(localStorage.getItem("reportFault"));

    for (var key in reportFaultDetails) {
        switch (key) {

            case 'carriage':
                $("#sumCarNo").empty();
                $("#sumCarNo").text(reportFaultDetails[key]);
                break;
            case 'category':
                $("#sumCat").empty();
                $("#sumCat").text(reportFaultDetails[key].charAt(0).toUpperCase() + reportFaultDetails[key].slice(1));
                break;
            case 'description':
                $("#sumDes").empty();
                $("#sumDes").text(reportFaultDetails[key].charAt(0).toUpperCase() + reportFaultDetails[key].slice(1));
                break;
            case 'location':
                $("#sumLoc").empty();
                $("#sumLoc").text(reportFaultDetails[key].charAt(0).toUpperCase() + reportFaultDetails[key].slice(1));
                break;
        }

    }
}

// When an event listener’s event occurs it calls its associated function and passes a reference to the event object
// the function below picks up that event 
function setFaultImage(event) {

    // image
    var file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = function (e) {
        addFaultDetails('img', e.target.result);
        $('#sumImg').attr('src', e.target.result);
        console.log(e.target.result);
    };

    reader.readAsDataURL(file);
}

function showImage() {
    var json = JSON.stringify('carriageNo');
    $.ajax({
        url: "http://localhost:8081/show_image",
        type: "POST",
        data: json,
        success: function (rt) {

            var json = JSON.parse(rt);
            console.log(json);
            console.log(json[0].img);
            $('#imagetest').attr('src', json[0].img);

        },
        error: function () {
            alert("there has been an error contacting the server");
            console.log("data not submitted");
        }
    });
}