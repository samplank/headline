chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      nytSignIn = location.href.includes("nytimes.com");
      var atlanticSignIn = $('a[href*="accounts.theatlantic.com/login/"]').get(0);
      var wapoSignIn = $('#actAction');

      if (nytSignIn) {
      	location.reload();
      } else if (atlanticSignIn) {
      	atlanticSignIn.click()
      } else if (wapoSignIn) {
      	wapoSignIn.click()
      }

    }
  }
);