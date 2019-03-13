$(function() {
  document.getElementById("cantFindID").addEventListener("click", function() {
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

  setTimeout(function() {
    classFrom.removeClass("fade");
  }, 0);

  setTimeout(function() {
    classFrom.removeClass("current");
  }, 500);

  setTimeout(function() {
    classTo.addClass("current");
  }, 500);

  setTimeout(function() {
    classTo.addClass("fade");
  }, 1000);
}

function login(from) {
  if (from === "login") {
    // checkStaffID();
    switchPages("login", "options");
  }
}

function clearIssues() {
  setTimeout(function() {
    $(".issue").removeClass("show");
  }, 500);
}

function checkCar() {
  var carExists = false;
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
    success: function(rt) {
      output = JSON.parse(rt)[0];
      var id_exists = output.check_id;
      if (id_exists) {
        localStorage.setItem("userID", userID);
        switchPages("login", "options");
      }
    },
    error: function() {
      console.log("error");
      //alert("error");
    }
  });
}
