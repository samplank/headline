$(document).ready(function() {
  chrome.runtime.sendMessage({message: "popupRequestCredits"});
  chrome.runtime.sendMessage({message: "popupRequestAuthentication"});

  var num_credits = document.getElementById("num_credits");
  var form = document.getElementById("credentials");

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // var authenticated_div = document.getElementById('authenticated');
      // var notauthenticated_div = document.getElementById('not_authenticated');
      console.log(request);

      var num_credits = document.getElementById("num_credits");
      
      if (request.is_auth === 'exists user') {
        document.getElementById('exists_user').style = "display: block";
        document.getElementById('new_user').style = "display: none";
        document.getElementById('not_authenticated').style = "display: none";

        chrome.runtime.sendMessage({message: "popupRequestCredits"});

      } else if (request.is_auth === 'new user') {
        document.getElementById('exists_user').style = "display: none";
        document.getElementById('new_user').style = "display: block";
        document.getElementById('not_authenticated').style = "display: none";

      } else if (request.is_auth === 'not authenticated') {
        document.getElementById('exists_user').style = "display: block";
        document.getElementById('new_user').style = "display: block";
        document.getElementById('not_authenticated').style = "display: none";

      }

      if (request.num_credits <= 0) {
        num_credits.innerHTML = "You are out of credits!";
        // document.getElementById("headlineView").disabled = true;
      } else if (request.num_credits > 0) {
        console.log('credits received')
        var credits = request.num_credits;
          // var message = document.getElementById("message");
          console.log(num_credits);
          num_credits.innerHTML = "You have " + credits + " credits";
        }
    }
  );

  if (form) {
    form.addEventListener('submit', function (evt) {
        evt.preventDefault();
        
        var nyt_login = document.getElementById("nyt_login").value;
        var nyt_pass = document.getElementById("nyt_pass").value;
        var wapo_login = document.getElementById("wapo_login").value;
        var wapo_pass = document.getElementById("wapo_pass").value;
        var atlantic_login = document.getElementById("atlantic_login").value;
        var atlantic_pass = document.getElementById("atlantic_pass").value;
        
        chrome.runtime.sendMessage(
          {
            is_credentials: true,
            nyt_login: nyt_login,
            nyt_pass: nyt_pass,
            wapo_login: wapo_login,
            wapo_pass: wapo_pass,
            atlantic_login: atlantic_login,
            atlantic_pass: atlantic_pass
          }
        );


    })
  }




  try {
  	document.getElementById("getmoreCredits").addEventListener("click", getMoreCredits);
  }
  catch(err) {
  	console.log(err);
  }
});

function getMoreCredits(){
  chrome.runtime.sendMessage({message: "getMoreCredits"});
}
