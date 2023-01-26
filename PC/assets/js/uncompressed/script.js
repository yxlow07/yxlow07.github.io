let marksAndPemberat = {
  chinese: [7, "x"],
  bm: [6, "x"],
  eng: [5, "x"],
  mm: [5, "x"],
  sc: [5, "x"],
  "rbt/ask": [4, "x"],
  sjh: [3, "x"],
  geo: [3, "x"],
  cocurriculum: [3, "x"],
  moral: [3, "x"],
  PJK: [2, "x"],
  seni: [2, "x"],
  seni: [3, "x"],
};
let errorToastCounter = 0;
let actualTotalPemberat = 0;

function showValueExceedError(msg) {
  errorToastCounter += 1;
  let id = "et" + errorToastCounter;
  let errorToast = `<div class="position-fixed bottom-0 end-0 p-3" style="1"> <div id="${id}" class="toast text-white bg-danger border-0 d-flex" data-bs-delay="5000" role="alert" aria-live="assertive" aria-atomic="true"> <div class="toast-body"> ${msg} </div> <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div> </div>`;

  $(".err").append(errorToast);

  let toast = new bootstrap.Toast($(`#${id}`));
  toast.show();
}

for (const subject in marksAndPemberat) {
  let pemberat = marksAndPemberat[subject][0];
  $("#tbody").append(
    `<tr> <th scope="row" class="text-capitalize">${subject}</th> <td>${pemberat}</td><td> <label><input type="number" name="${subject}" min="0" max="100" class="form-control wide marks"></label> </td></tr>`
  );
  actualTotalPemberat += pemberat;
}

function calculatePurata() {
  let totalMarksWithPemberat = 0;
  let totalPemberat = 0;

  for (const subject in marksAndPemberat) {
    let pemberat = marksAndPemberat[subject][0];
    let marks = marksAndPemberat[subject][1];
    if (marks !== "x") {
      totalMarksWithPemberat += marks * pemberat;
      totalPemberat += pemberat;
    }
  }

  return [
    totalMarksWithPemberat / totalPemberat,
    totalMarksWithPemberat,
    totalPemberat,
    actualTotalPemberat - totalPemberat,
  ];
}

function updatePurata(purata) {
  let roundedPurata = Math.round((purata + Number.EPSILON) * 100) / 100;
  if (roundedPurata < 60) {
    $("#purata-badge")
      .addClass("btn-danger")
      .removeClass("btn-success btn-primary");
  } else {
    if (roundedPurata >= 90) {
      $("#purata-badge")
        .addClass("btn-primary")
        .removeClass("btn-success btn-danger");
    } else {
      $("#purata-badge")
        .addClass("btn-success")
        .removeClass("btn-danger btn-primary");
    }
  }
  $("#purata").html(roundedPurata);
}

function validateMarksAndUpdate(subject, marks) {
  try {
    if (0 <= marks && marks <= 100) {
      marksAndPemberat[subject][1] = marks;
    } else if (marks === "") {
      marksAndPemberat[subject][1] = "x";
    } else {
      marksAndPemberat[subject][1] = "x";
      showValueExceedError("Value must be between 0 and 100");
      $(`[name=${subject}]`).val("");
    }
    updatePurata(calculatePurata()[0]);
  } catch (e) {
    // Do nothing hide the error from user-....
  }
}

$(document).ready(() => {
  $(".marks").on("keyup change", function () {
    let name = $(this).attr("name");
    let marks = parseInt($(this).val());
    validateMarksAndUpdate(name, marks);
  });

  $(".col.outline-white").on("mousedown", function (event) {
    event.preventDefault();
    let id = $(this).attr("id");

    if (id !== "-") {
      let focused = $("input:focus");
      let focusedName =
        focused.attr("name") === undefined ? "none" : focused.attr("name");
      let focusedNameSelector = "[name='" + focusedName + "']";
      let focusedVal = $(focusedNameSelector).val();

      if (focusedName !== "none" && id !== "<-") {
        let marks = parseInt(focusedVal.toString() + id);
        $(focusedNameSelector).val(marks);
      } else if (id === "<-") {
        if (focusedVal < 10) {
          $(focusedNameSelector).val("");
        } else {
          $(focusedNameSelector).val(Math.floor(focusedVal / 10));
        }
      }
      validateMarksAndUpdate(focusedName, $(focusedNameSelector).val());
    }
  });
});
