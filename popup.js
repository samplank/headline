$(document).ready(function() {
  chrome.runtime.sendMessage({message: "popupRequestCredits"});
  document.getElementById("getmoreCredits").addEventListener("click", getMoreCredits);
});

function getMoreCredits(){
  chrome.runtime.sendMessage({message: "getMoreCredits"});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	var message = document.getElementById("message")
	if (request.num_credits <= 0) {
		message.innerHTML = "You are out of credits!";
		// document.getElementById("headlineView").disabled = true;
	} else if (request.num_credits > 0) {
		console.log('credits received')
		var credits = request.num_credits;
	  	var message = document.getElementById("message");
	  	message.innerHTML = "You have " + credits + " credits";
  	}
  }
);
