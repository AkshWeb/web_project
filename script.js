/* ==========================================================================
   FitFlex — shared behaviour
   1. Body maps   : draws the front/back figure and lights up worked muscles
   2. Library     : filter by muscle group + search by name
   3. Contact form: inline validation and a confirmation message
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- 1 ---
     BODY MAP
     One schematic mannequin, drawn twice: front view and back view.
     Each shape carries the muscle groups it represents, so a card with
     data-muscles="chest shoulders arms" lights the right parts.
     ---------------------------------------------------------------------- */

  // [x, y, width, height, cornerRadius, frontGroup, backGroup]
  var SHAPES = [
    [ 62,  56, 12,  8, 3, "", ""],            // neck
    [ 30,  62, 22, 20, 9, "shoulders", "shoulders"], // left deltoid
    [ 84,  62, 22, 20, 9, "shoulders", "shoulders"], // right deltoid
    [ 40,  66, 26, 40, 8, "chest", "back"],   // left pec / lat
    [ 70,  66, 26, 40, 8, "chest", "back"],   // right pec / lat
    [ 46, 108, 44, 48, 9, "core", "back"],    // abdomen / lower back
    [ 22,  84, 16, 44, 8, "arms", "arms"],    // left upper arm
    [ 98,  84, 16, 44, 8, "arms", "arms"],    // right upper arm
    [ 20, 130, 14, 40, 7, "arms", "arms"],    // left forearm
    [102, 130, 14, 40, 7, "arms", "arms"],    // right forearm
    [ 44, 158, 48, 26, 9, "", "legs"],        // hips / glutes
    [ 44, 186, 22, 62, 9, "legs", "legs"],    // left thigh
    [ 70, 186, 22, 62, 9, "legs", "legs"],    // right thigh
    [ 47, 250, 17, 54, 8, "legs", "legs"],    // left lower leg
    [ 71, 250, 17, 54, 8, "legs", "legs"]     // right lower leg
  ];

  function figure(offsetX, worked, view, interactive) {
    var svg = '<g transform="translate(' + offsetX + ',0)">';
    svg += '<ellipse class="part" cx="68" cy="34" rx="17" ry="20" />';

    SHAPES.forEach(function (s) {
      var group = view === "front" ? s[5] : s[6];
      var on = group && worked.indexOf(group) !== -1 ? " on" : "";
      var extra = "";
      if (interactive && group) {
        extra = ' data-group="' + group + '" tabindex="0" role="button"' +
                ' aria-label="Show ' + group + ' exercises"';
      }
      svg += '<rect class="' + (interactive && group ? "zone" : "part") + on +
             '" x="' + s[0] + '" y="' + s[1] + '" width="' + s[2] +
             '" height="' + s[3] + '" rx="' + s[4] + '"' + extra + ' />';
    });

    svg += '<text class="label" x="68" y="326" text-anchor="middle">' +
           (view === "front" ? "Front" : "Back") + "</text>";
    svg += "</g>";
    return svg;
  }

  function drawMap(el, interactive) {
    var worked = (el.getAttribute("data-muscles") || "").split(/\s+/);
    var svg =
      '<svg class="bodymap' + (interactive ? " bodymap-pick" : "") +
      '" viewBox="0 0 296 336" role="img" aria-label="Muscles worked: ' +
      (worked.join(", ") || "none highlighted") + '">' +
      figure(0, worked, "front", interactive) +
      figure(160, worked, "back", interactive) +
      "</svg>";
    el.innerHTML = svg;
  }

  document.querySelectorAll("[data-bodymap]").forEach(function (el) {
    drawMap(el, el.hasAttribute("data-interactive"));
  });

  /* ---------------------------------------------------------------- 2 ---
     LIBRARY FILTERING
     ---------------------------------------------------------------------- */

  var grid = document.getElementById("exercise-grid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".exercise"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter"));
    var search = document.getElementById("search");
    var count = document.getElementById("result-count");
    var empty = document.getElementById("no-results");
    var heroMap = document.querySelector("[data-interactive]");
    var active = "all";

    function apply() {
      var term = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;

      cards.forEach(function (card) {
        var muscles = card.getAttribute("data-muscles") || "";
        var name = card.getAttribute("data-name") || "";
        var equipment = (card.getAttribute("data-equipment") || "").toLowerCase();

        var matchesGroup = active === "all" || muscles.indexOf(active) !== -1;
        var matchesTerm =
          !term || name.indexOf(term) !== -1 || equipment.indexOf(term) !== -1;

        var visible = matchesGroup && matchesTerm;
        card.hidden = !visible;
        if (visible) shown++;
      });

      if (count) {
        count.textContent =
          shown + (shown === 1 ? " exercise" : " exercises") +
          (active === "all" ? "" : " for " + active) +
          (term ? ' matching "' + search.value.trim() + '"' : "");
      }
      if (empty) empty.hidden = shown !== 0;

      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.group === active));
      });

      if (heroMap) {
        heroMap.querySelectorAll(".zone").forEach(function (z) {
          z.classList.toggle("on", active !== "all" && z.dataset.group === active);
        });
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        active = b.dataset.group;
        apply();
      });
    });

    if (search) search.addEventListener("input", apply);

    if (heroMap) {
      var pick = function (group) {
        active = active === group ? "all" : group;
        apply();
        document.getElementById("library").scrollIntoView({ block: "start" });
      };
      heroMap.addEventListener("click", function (e) {
        var zone = e.target.closest(".zone");
        if (zone) pick(zone.dataset.group);
      });
      heroMap.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var zone = e.target.closest(".zone");
        if (zone) { e.preventDefault(); pick(zone.dataset.group); }
      });
    }

    var reset = document.getElementById("reset-filters");
    if (reset) {
      reset.addEventListener("click", function () {
        active = "all";
        if (search) search.value = "";
        apply();
      });
    }

    apply();
  }

  /* ---------------------------------------------------------------- 3 ---
     CONTACT FORM
     There is no server behind this page, so the form confirms locally.
     Point the <form> action at your own endpoint when you have one.
     ---------------------------------------------------------------------- */

  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");

    var rules = {
      name: function (v) { return v.length >= 2 ? "" : "Enter your name."; },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
          ? "" : "Enter an email address we can reply to.";
      },
      topic: function (v) { return v ? "" : "Pick what your message is about."; },
      message: function (v) {
        return v.length >= 20 ? "" : "Tell us a little more — 20 characters or so.";
      }
    };

    function check(field) {
      var input = form.elements[field];
      var wrap = input.closest(".field");
      var slot = wrap.querySelector(".error");
      var msg = rules[field](input.value.trim());
      slot.textContent = msg;
      wrap.classList.toggle("invalid", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }

    Object.keys(rules).forEach(function (field) {
      var input = form.elements[field];
      input.addEventListener("blur", function () { check(field); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) check(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);

      if (!ok) {
        status.hidden = true;
        form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea").focus();
        return;
      }

      status.hidden = false;
      status.querySelector("p").textContent =
        "Thanks, " + form.elements.name.value.trim() +
        ". Your message is on its way — a coach replies within two working days.";
      status.focus();
      form.reset();
    });
  }
})();
