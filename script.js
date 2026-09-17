// FitFlex - simple javascript

// show only exercises that match the chosen muscle group
function filterMuscle(group) {
  var exercises = document.getElementsByClassName("exercise");

  for (var i = 0; i < exercises.length; i++) {
    var muscle = exercises[i].getAttribute("data-muscle");

    if (group == "all" || muscle == group) {
      exercises[i].style.display = "block";
    } else {
      exercises[i].style.display = "none";
    }
  }
}

// show only exercises that match the search box text
function searchExercise() {
  var input = document.getElementById("searchInput").value;
  input = input.toLowerCase();

  var exercises = document.getElementsByClassName("exercise");

  for (var i = 0; i < exercises.length; i++) {
    var name = exercises[i].getElementsByTagName("h3")[0].innerHTML;
    name = name.toLowerCase();

    if (name.indexOf(input) > -1) {
      exercises[i].style.display = "block";
    } else {
      exercises[i].style.display = "none";
    }
  }
}

// check the contact form before it submits
function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var message = document.getElementById("message").value;

  if (name == "") {
    alert("Please enter your name.");
    return false;
  }

  if (email == "" || email.indexOf("@") == -1) {
    alert("Please enter a valid email.");
    return false;
  }

  if (message == "") {
    alert("Please enter a message.");
    return false;
  }

  alert("Thanks " + name + "! Your message has been noted.");
  return false; // change to "return true;" once a real server is set up
}
