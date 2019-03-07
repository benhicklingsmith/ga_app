$("#cantFindID").click(function () {
    $(".findIDForm")
            .addClass("show")
            .removeClass("hidden");
});

$("#closeIDForm").click(function () {
    $(".findIDForm")
            .addClass("hidden")
            .removeClass("show");
});

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
