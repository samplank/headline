chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clickLoginButton" ) {

      if (location.href.includes("nytimes.com")) {
      	// var nytSignIn = $('button:contains("Log In")').first();
        location.reload();

      } else if (location.href.includes("washingtonpost.com")) {
        var wapoSignIn = $('a[href*="washingtonpost.com/subscribe/signin/"]').get(0);
      	wapoSignIn.click();

      } else if (location.href.includes("theatlantic.com")) {
      	var atlanticSignIn = $('a[href*="accounts.theatlantic.com/login/"]').get(0);
      	atlanticSignIn.click();
      	
      }
    }
  }
);