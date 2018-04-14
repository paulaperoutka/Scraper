$("#scrape").on("click", () => {
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .done((data) => {
    console.log(data);
    window.location="/";
  });
});