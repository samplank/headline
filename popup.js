$(document).ready(function() {
  chrome.runtime.sendMessage({message: "popupRequestCredits"});
  chrome.runtime.sendMessage({message: "popupRequestAuthentication"});

  var num_credits = document.getElementById("num_credits");
  var form = document.getElementById("credentials");

  $('body').on('click', 'a', function(){
   try {
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   } catch(err) {
    console.log(err);
   }
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // var authenticated_div = document.getElementById('authenticated');
      // var notauthenticated_div = document.getElementById('not_authenticated');

      var num_credits_paid = document.getElementById("num_credits_paid");
      var num_credits_free = document.getElementById("num_credits_trial");

      
      if (request.is_auth === 'paid user') {
        document.getElementById('welcome').style = "display: none";
        document.getElementById('paid_user').style = "display: block";
        document.getElementById('trial_user_one').style = "display: none";
        document.getElementById('trial_user_two').style = "display: none";
        document.getElementById('not_authenticated').style = "display: none";
        document.getElementById("num_credits_paid").style = "display: block";
        document.getElementById("num_credits_trial").style = "display: block";

        chrome.runtime.sendMessage({message: "popupRequestCredits"});

      } else if (request.is_auth === 'trial user') {
        document.getElementById('welcome').style = "display: block";
        document.getElementById('paid_user').style = "display: none";
        document.getElementById('trial_user_one').style = "display: block";
        document.getElementById('trial_user_two').style = "display: block;";
        document.getElementById('not_authenticated').style = "display: none";
        document.getElementById("num_credits_paid").style = "display: block";
        document.getElementById("num_credits_trial").style = "display: block";

      } else if (request.is_auth === 'not authenticated') {
        document.getElementById('welcome').style = "display: none";
        document.getElementById('paid_user').style = "display: none";
        document.getElementById('trial_user_one').style = "display: none";
        document.getElementById('trial_user_two').style = "display: none";
        document.getElementById('not_authenticated').style = "display: block";
        document.getElementById("num_credits_paid").style = "display: none";
        document.getElementById("num_credits_trial").style = "display: none";

      }

      if (request.num_credits <= 0) {
        num_credits_paid.innerHTML = "You are out of articles!";
        num_credits_free.innerHTML = "You are out of articles!";

      } else if (request.num_credits > 0) {
        var credits = request.num_credits;
          num_credits_paid.innerHTML = credits;
          num_credits_free.innerHTML = credits + " free articles left";
      }

      if (request.top_site === 'nyt') {
        document.getElementById('top_publication').innerHTML = "New York Times. Want to <a href='https://www.nytimes.com/subscription'>subscribe</a>?";
      } else if (request.top_site === 'wapo') {
        document.getElementById('top_publication').innerHTML = "Washington Post. Want to <a href='https://subscribe.washingtonpost.com/'>subscribe</a>?";
      } else if (request.top_site === 'atlantic') {
        document.getElementById('top_publication').innerHTML = "Atlantic. Want to <a href='https://accounts.theatlantic.com/products/'>subscribe</a>?";
      } else if (request.top_site === 'newyorker') {
        document.getElementById('top_publication').innerHTML = "New Yorker. Want to <a href='https://subscribe.newyorker.com/'>subscribe</a>?";
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

      document.getElementById('welcome').style = "display: none";
      document.getElementById('paid_user').style = "display: block";
      document.getElementById('trial_user_one').style = "display: none";
      document.getElementById('trial_user_two').style = "display: none";
      document.getElementById('not_authenticated').style = "display: none";
      document.getElementById("num_credits_paid").style = "display: block";
      document.getElementById("num_credits_trial").style = "display: block";

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
