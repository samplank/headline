$(document).ready(function() {
  chrome.runtime.sendMessage({message: "popupRequestCredits"});
  chrome.runtime.sendMessage({message: "popupRequestAuthentication"});

  var num_credits = document.getElementById("num_credits");
  var form = document.getElementById("credentials");

  $('body').on('click', 'a', function(){
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
   });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // var authenticated_div = document.getElementById('authenticated');
      // var notauthenticated_div = document.getElementById('not_authenticated');
      console.log(request);

      var num_credits = document.getElementById("num_credits");
      
      if (request.is_auth === 'paid user') {
        document.getElementById('paid_user').style = "display: block";
        document.getElementById('trial_user').style = "display: none";
        document.getElementById('not_authenticated').style = "display: none";
        document.getElementById("num_credits").style = "display: block";

        chrome.runtime.sendMessage({message: "popupRequestCredits"});

      } else if (request.is_auth === 'trial user') {
        document.getElementById('paid_user').style = "display: none";
        document.getElementById('trial_user').style = "display: block";
        document.getElementById('not_authenticated').style = "display: none";
        document.getElementById("num_credits").style = "display: block";


      } else if (request.is_auth === 'not authenticated') {
        document.getElementById('paid_user').style = "display: none";
        document.getElementById('trial_user').style = "display: none";
        document.getElementById('not_authenticated').style = "display: block";
        document.getElementById("num_credits").style = "display: none";


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
      
      var license = document.getElementById("license").value;
      
      chrome.runtime.sendMessage(
        {
          is_credentials: true,
          license: license
        }
      );

      document.getElementById('paid_user').style = "display: block";
      document.getElementById('trial_user').style = "display: none";
      document.getElementById('not_authenticated').style = "display: none";
      document.getElementById("num_credits").style = "display: block";

      chrome.runtime.sendMessage({message: "popupRequestCredits"});
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
