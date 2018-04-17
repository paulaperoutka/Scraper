//Scrape
$("#scrape").on("click", () => {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done((data) => {
    console.log(data);
    window.location="/";
  });
});

//Save, no ES6, this = window b/c of scope inheritance
$(".save").on("click", function () {
  let thisArticle = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/save/" + thisArticle
  }).done((data) => {
    window.location = "/saved";
  });
});

//Unsave, no ES6
$(".unsave").on("click", function () {
  const thisArticle = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/delete/" + thisArticle
  }).done((data) => {
    window.location = "/saved";
  });
});

//Pop up modal
$(".add-note").on("click", function () {
  const thisArticle = $(this).attr("data-id");
    console.log(thisArticle);
  $("#modalNote"+thisArticle).modal();
});
