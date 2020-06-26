$(document).ready(function() {
  document.getElementById("headlineView").addEventListener("click", sendSignIn);
});

function sendSignIn(){
  chrome.runtime.sendMessage({message: "popupButtonClicked"});
  console.log('popupButtonClicked sent!')
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log(request);
  	var message = document.getElementById("message")
	if (request.num_credits <= 0) {
		message.innerHTML = "You are out of credits!";
		document.getElementById("headlineView").disabled = true;
	} else if (request.num_credits > 0) {
		console.log('credits received')
		var credits = request.num_credits;
	  	var message = document.getElementById("message");
	  	message.innerHTML = "You have " + credits + " credits";
  	}
  }
);

chrome.runtime.sendMessage({message: "requestCredits"});