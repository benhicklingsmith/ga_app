function test(input) {
    // convert the parameters to a JSON data string
    
    var json = JSON.stringify(input);
    
    $.ajax({
        url: "http://localhost:8081/get_staff",
        type: "POST",
        data: json,
        success: function (rt) {
            var json = JSON.parse(rt);
            console.log(json);
        },
        error: function () {
            console.log("error");
            //alert("error");
        }
    });
}
;

document.getElementById("cantFindID").addEventListener("click", function() {
  findID();
});

function findID() {
  $(".login").removeClass("current");
  $(".findID").addClass("current");
  $("#footerBtn1").removeAttr("onclick");
  $("#footerBtn1").attr("onclick", "login('fromID')");
}

function closeFindID() {
  $(".findID").removeClass("current");
  $(".login").addClass("current");
  $("#footerBtn1").removeAttr("onclick");
  $("#footerBtn1").attr("onclick", "login('fromLogin')");
}

function login(from) {
  if (from === "fromLogin") {
    var idExists = true;
    //   if the database contains the staff id from the login page then set the local/session storage, add current to the app section and change the login button to 'previous'. If it doesn't add a 'can't find id, please try again' underneath the staff id input
    if (idExists) {
      $(".login").removeClass("current");
      $(".app").addClass("current");
      $("#footerBtn1").empty();
      $("#footerBtn1").append("Previous");
      $("#footerBtn1").removeAttr("onclick");
      $("#footerBtn1").attr("onclick", "previous('loginPage')");
    }
  } else if (from === "fromID") {
    $(".findID").removeClass("current");
    $(".app").addClass("current");
    $("#footerBtn1").empty();
    $("#footerBtn1").append("Previous");
    $("#footerBtn1").removeAttr("onclick");
    $("#footerBtn1").attr("onclick", "previous('loginPage')");
  }
}

function previous(to) {
  if (to === "loginPage") {
    $(".app").removeClass("current");
    $(".login").addClass("current");
    $("#footerBtn1").removeAttr("onclick");
    $("#footerBtn1").attr("onclick", "login('fromLogin')");
    $("#footerBtn1").empty();
    $("#footerBtn1").append("Login");
  }
}