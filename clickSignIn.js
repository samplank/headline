chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {

      if (location.href.includes("nytimes.com")) {
      	var nytSignIn = $('button:contains("Log In")').first();
      	nytSignIn.click();

      } else if (location.href.includes("washingtonpost.com")) {
      	var wapoSignIn = $('#actAction');
      	wapoSignIn.click();

      } else if (location.href.includes("theatlantic.com")) {
      	var atlanticSignIn = $('a[href*="accounts.theatlantic.com/login/"]').get(0);
      	atlanticSignIn.click();
      	
      }
    }
  }
);