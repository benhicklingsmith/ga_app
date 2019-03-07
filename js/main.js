$("#cantFindID").click(function() {
  $(".findIDForm")
    .addClass("show")
    .removeClass("hidden");
});

$("#closeIDForm").click(function() {
  $(".findIDForm")
    .addClass("hidden")
    .removeClass("show");
});
