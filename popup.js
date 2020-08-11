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

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
    }
  },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: '#',
  signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ]
};