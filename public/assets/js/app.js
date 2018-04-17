$("#scrape").on("click", () => {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done((data) => {
    console.log(data);
    window.location="/";
  });
});

//no ES6, this = window b/c of scope inheritance
$(".save").on("click", function () {
  let thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/save/" + thisId
  }).done((data) => {
    window.location = "/saved";
  });
});



