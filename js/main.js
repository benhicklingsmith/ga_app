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

function test(input) {
  // convert the parameters to a JSON data string

  var json = JSON.stringify(input);

  function checkStaffID(){
    var userID = $('#idInputBox').val();
    var json = JSON.stringify(userID);
    var output = {};
    $.ajax({
        url: "http://localhost:8081/get_staff",
        type: "POST",
        data: json,
        success: function (rt) {
          output = JSON.parse(rt)[0];
          var id_exists = output.check_id;
          if(id_exists){
            localStorage.setItem('userID',userID);
            switchPages('login','options');
          }
        },
        error: function () {
            console.log("error");
            //alert("error");
        }
    });
};
}
