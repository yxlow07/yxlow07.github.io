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
  },
  errorToastCounter = 0,
  actualTotalPemberat = 0;
for (const a in marksAndPemberat) {
  let t = marksAndPemberat[a][0];
  $("#tbody").append(
    `<tr> <th scope="row" class="text-capitalize">${a}</th> <td>${t}</td><td> <label><input type="number" name="${a}" min="0" max="100" class="form-control wide marks"></label> </td></tr>`
  ),
    (actualTotalPemberat += t);
}
function showValueExceedError(a) {
  let t = "et" + (errorToastCounter += 1),
    e = `<div class="position-fixed bottom-0 end-0 p-3" style="1"> <div id="${t}" class="toast text-white bg-danger border-0 d-flex" data-bs-delay="5000" role="alert" aria-live="assertive" aria-atomic="true"> <div class="toast-body"> ${a} </div> <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div> </div>`;
  $(".err").append(e), new bootstrap.Toast($(`#${t}`)).show();
}
function validate(a) {
  return (
    !(a < 0 || a > 100) ||
    (showValueExceedError("Value should be around 0 and 100"), !1)
  );
}
function calculatePurata() {
  let a = 0,
    t = 0;
  for (const e in marksAndPemberat) {
    let r = marksAndPemberat[e][0],
      n = marksAndPemberat[e][1];
    "x" !== n && ((a += n * r), (t += r));
  }
  return [a / t, a, t, actualTotalPemberat - t];
}
function validateMarksAndUpdate(a, t) {
  try {
    0 <= t && t <= 100
      ? (marksAndPemberat[a][1] = t)
      : "" === t
      ? (marksAndPemberat[a][1] = "x")
      : ((marksAndPemberat[a][1] = "x"),
        showValueExceedError("Value must be between 0 and 100"),
        $(`[name='${a}']`).val("")),
      calcTarget();
  } catch (a) {}
}
function validateTarget(a) {
  return validate(a) ? ((target = a), calcTarget(), !0) : ((target = "x"), !1);
}
function updateAvg(a) {
  let t = Math.round(100 * (a + Number.EPSILON)) / 100;
  t > 100
    ? $("#puratatcb")
        .addClass("btn-danger")
        .removeClass("btn-success btn-primary btn-warning")
    : t > 90
    ? $("#puratatcb")
        .addClass("btn-warning")
        .removeClass("btn-success btn-primary btn-danger")
    : t > 0
    ? $("#puratatcb")
        .addClass("btn-success")
        .removeClass("btn-primary btn-warning btn-danger")
    : $("#puratatcb")
        .addClass("btn-primary")
        .removeClass("btn-success btn-warning btn-danger"),
    $("#puratatc").html(t);
}
function calcTarget() {
  if ("x" === target) return !1;
  {
    let a = calculatePurata();
    if (0 !== a[3]) {
      updateAvg((target * actualTotalPemberat - a[1]) / a[3]);
    } else updateAvg(0);
  }
}
$(document).ready(() => {
  $(".marks").on("keyup change", function () {
    validateMarksAndUpdate($(this).attr("name"), parseInt($(this).val()));
  }),
    $("[name='target']").on("keyup change", function () {
      validateTarget($(this).val()) || ($(this).val(""), (target = "x"));
    }),
    $(".col.outline-white").on("mousedown", function (a) {
      a.preventDefault();
      let t = $(this).attr("id");
      if ("-" !== t) {
        let a = $("input:focus"),
          e = void 0 === a.attr("name") ? "none" : a.attr("name"),
          r = "[name='" + e + "']",
          n = $(r).val();
        if ("none" !== e && "<-" !== t) {
          let a = parseInt(n.toString() + t);
          $(r).val(a);
        } else
          "<-" === t &&
            (n < 10
              ? ($(r).val(""), (marksAndPemberat[r][1] = "x"))
              : $(r).val(Math.floor(n / 10)));
        "target" === e
          ? validateTarget($(r).val()) || ($(r).val(""), (target = "x"))
          : validateMarksAndUpdate(e, $(r).val());
      }
    }),
    $("#calc").on("click", function () {
      for (const a in marksAndPemberat) {
        let t = $(`[name='${a}']`).val();
        (marksAndPemberat[a][1] = t),
          ("" !== t && null != t) || (marksAndPemberat[a][1] = "x");
      }
      calcTarget();
    });
});
