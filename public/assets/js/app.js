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
$(".save-article").on("click", function () {
  let thisArticle = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/save/" + thisArticle
  }).done((data) => {
    window.location = "/saved";
  });
});

//Unsave, no ES6
$(".unsave-article").on("click", function () {
  const thisArticle = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/delete/" + thisArticle
  }).done((data) => {
    window.location = "/saved";
  });
});

//Pop up modal
$(".notes-btn").on("click", function () {
  const thisArticle = $(this).attr("data-id");
  console.log("Getting notes attached to article: " + thisArticle);
  $("#modalNote"+thisArticle).modal();
});

$(".add-note").on("click", function () {
  const thisArticle = $(this).attr("data-id");
  console.log($("#noteText" + thisArticle).val());


  if(!$("#noteText" + thisArticle).val()) {
    console.log("No text!");
  } else {
    // console.log($(".form-control").val());
    $.ajax({
      method: "POST",
      url: "/notes/save/" + thisArticle,
      data: {
        text: $("#noteText" + thisArticle).val()
      }
    }).done(function(data) {
      console.log(data);
      $(".form-control").val("");
      // $("#modalNote" + thisArticle).modal("hide");
      window.location = "/saved";
    });
  }
});

$(".delete-note").on("click", function () {
  const thisNote = $(this).attr("note-id");
  const thisArticle = $(this).attr("article-id");

  console.log("Note id: " + thisNote + " for article: " + thisArticle);

  $.ajax({
    method: "DELETE",
    url: "/notes/delete/" + thisNote + "/" + thisArticle
  }).done((data) => {
    console.log(data);
    // $("#modalNote" + thisArticle).modal("hide");
    // $("#modalNote" + thisArticle).modal();
    window.location="/saved";
  });
});


