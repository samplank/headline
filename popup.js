$(document).ready(function() {
  chrome.runtime.sendMessage({message: "popupRequestCredits"});
  chrome.runtime.sendMessage({message: "popupRequestAuthentication"});


  console.log(document.getElementById('authenticated'))
  console.log(document.getElementById('not_authenticated'))

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // var authenticated_div = document.getElementById('authenticated');
      // var notauthenticated_div = document.getElementById('not_authenticated');
      console.log(request);
      
      if (request.is_auth === 'authenticated') {


        document.getElementById('not_authenticated').style = "display: none";
        document.getElementById('authenticated').style = "display: block";


        chrome.runtime.sendMessage({message: "popupRequestCredits"});

      } else if (request.is_auth === 'not authenticated') {
        document.getElementById('authenticated').style.display = "none";
        document.getElementById('not_authenticated').style.display = "block";
      }
      if (request.num_credits <= 0) {
        message.innerHTML = "You are out of credits!";
        // document.getElementById("headlineView").disabled = true;
      } else if (request.num_credits > 0) {
        console.log('credits received')
        var credits = request.num_credits;
          // var message = document.getElementById("message");
          message.innerHTML = "You have " + credits + " credits";
        }
    }
  );




  try {
  	document.getElementById("getmoreCredits").addEventListener("click", getMoreCredits);
  }
  catch(err) {
  	console.log(err);
  }
});

// var authenticated_div = document.getElementById('authenticated');
// var notauthenticated_div = document.getElementById('not_authenticated');
// var message = document.getElementById("message")

// console.log(document.getElementById('authenticated'))
// console.log(document.getElementById('not_authenticated'))

function getMoreCredits(){
  chrome.runtime.sendMessage({message: "getMoreCredits"});
}

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     var authenticated_div = document.getElementById('authenticated');
//     var notauthenticated_div = document.getElementById('not_authenticated');
    
//     if (request.is_auth = 'authenticated') {

//       console.log('heard');
//       console.log(authenticated_div);
//       console.log(notauthenticated_div);
//       authenticated_div.style.display = "block";
//       notauthenticated_div.style.display = "none";
//       console.log(authenticated_div);
//       console.log(notauthenticated_div);
//     } else if (request.is_auth = 'not authenticated')
//       authenticated_div.style.display = "none";
//       notauthenticated_div.style.display = "block";

//   	if (request.num_credits <= 0) {
//   		message.innerHTML = "You are out of credits!";
//   		// document.getElementById("headlineView").disabled = true;
//   	} else if (request.num_credits > 0) {
//   		console.log('credits received')
//   		var credits = request.num_credits;
//   	  	// var message = document.getElementById("message");
//   	  	message.innerHTML = "You have " + credits + " credits";
//     	}
//   }
// );