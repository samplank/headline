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
  	if (request.num_credits) {
  		console.log('credits received')
  		var credits = request.num_credits;
	  	var message = document.getElementById("message");
	  	message.innerHTML = "You have " + credits + " credits";
  	}
  }
);