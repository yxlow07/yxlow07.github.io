let target = "x";
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

for (const subject in marksAndPemberat) {
  let pemberat = marksAndPemberat[subject][0];
  $("#tbody").append(
    `<tr> <th scope="row" class="text-capitalize">${subject}</th> <td>${pemberat}</td><td> <label><input type="number" name="${subject}" min="0" max="100" class="form-control wide marks"></label> </td></tr>`
  );
  actualTotalPemberat += pemberat;
}

function showValueExceedError(msg) {
  errorToastCounter += 1;
  let id = "et" + errorToastCounter;
  let errorToast = `<div class="position-fixed bottom-0 end-0 p-3" style="1"> <div id="${id}" class="toast text-white bg-danger border-0 d-flex" data-bs-delay="5000" role="alert" aria-live="assertive" aria-atomic="true"> <div class="toast-body"> ${msg} </div> <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div> </div>`;

  $(".err").append(errorToast);

  let toast = new bootstrap.Toast($(`#${id}`));
  toast.show();
}

function validate(value) {
  if (value < 0 || value > 100) {
    showValueExceedError("Value should be around 0 and 100");
    return false;
  }
  return true;
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

function validateMarksAndUpdate(subject, marks) {
  try {
    if (0 <= marks && marks <= 100) {
      marksAndPemberat[subject][1] = marks;
    } else if (marks === "") {
      marksAndPemberat[subject][1] = "x";
    } else {
      marksAndPemberat[subject][1] = "x";
      showValueExceedError("Value must be between 0 and 100");
      $(`[name='${subject}']`).val("");
    }
    calcTarget();
  } catch (e) {
    // Do nothing hide the error from user-....
  }
}

function validateTarget(val) {
  if (validate(val)) {
    target = val;
    calcTarget();
    return true;
  } else {
    target = "x";
    return false;
  }
}

function updateAvg(avgLeft) {
  let avgLeftRounded = Math.round((avgLeft + Number.EPSILON) * 100) / 100;

  if (avgLeftRounded > 100)
    $("#puratatcb")
      .addClass("btn-danger")
      .removeClass("btn-success btn-primary btn-warning");
  else if (avgLeftRounded > 90)
    $("#puratatcb")
      .addClass("btn-warning")
      .removeClass("btn-success btn-primary btn-danger");
  else if (avgLeftRounded > 0)
    $("#puratatcb")
      .addClass("btn-success")
      .removeClass("btn-primary btn-warning btn-danger");
  else
    $("#puratatcb")
      .addClass("btn-primary")
      .removeClass("btn-success btn-warning btn-danger");

  $("#puratatc").html(avgLeftRounded);
}

function calcTarget() {
  if (target === "x") {
    return false;
  } else {
    let calculatedPurata = calculatePurata();
    if (calculatedPurata[3] !== 0) {
      let avgLeft =
        (target * actualTotalPemberat - calculatedPurata[1]) /
        calculatedPurata[3];
      updateAvg(avgLeft);
    } else {
      updateAvg(0);
    }
  }
}

$(document).ready(() => {
  $(".marks").on("keyup change", function () {
    let name = $(this).attr("name");
    let marks = parseInt($(this).val());
    validateMarksAndUpdate(name, marks);
  });

  $("[name='target']").on("keyup change", function () {
    if (!validateTarget($(this).val())) {
      $(this).val("");
      target = "x";
    }
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
          marksAndPemberat[focusedNameSelector][1] = "x";
        } else {
          $(focusedNameSelector).val(Math.floor(focusedVal / 10));
        }
      }

      if (focusedName === "target") {
        if (!validateTarget($(focusedNameSelector).val())) {
          $(focusedNameSelector).val("");
          target = "x";
        }
      } else {
        validateMarksAndUpdate(focusedName, $(focusedNameSelector).val());
      }
    }
  });

  $("#calc").on("click", function () {
    for (const subject in marksAndPemberat) {
      let marks = $(`[name='${subject}']`).val();
      marksAndPemberat[subject][1] = marks;
      if (marks === "" || marks === null || marks === undefined) {
        marksAndPemberat[subject][1] = "x";
      }
    }
    calcTarget();
  });
});
