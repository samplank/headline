chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.num_credits > 0) {

      if (location.href.includes("nytimes.com")) {
        var nytSignIn = document.getElementById('email');
        if (nytSignIn) {
          chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt'});
        }


      } else if (location.href.includes("washingtonpost.com")) {
        // var wapoSignIn = $('a[href*="washingtonpost.com/subscribe/signin/"]').get(0);

        MutationObserverWaPo = window.MutationObserver || window.WebKitMutationObserver;

        var observerwapoSignIn= new MutationObserverWaPo(function(mutations, observer) {

          var wapoSignIn = document.getElementById('PAYWALL_V2_LOGIN');

          // password field has appeared
          if(wapoSignIn) {
            console.log(wapoSignIn);
            wapoSignIn.click();
            observerwapoSignIn.disconnect();
            chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'wapo'});
          }
        });

        observerwapoSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });              

      } else if (location.href.includes("theatlantic.com")) {

        var atlanticSignIn = $(":contains(Already a subscriber?)").get(0);
        console.log(atlanticSignIn);

      	// var atlanticSignIn = $('a[href*="accounts.theatlantic.com/login/"]').get(0);
       //  if (atlanticSignIn) {
       //    chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'atlantic'});
       //    atlanticSignIn.click();
       //  }

        MutationObserverAtlantic = window.MutationObserver || window.WebKitMutationObserver;

        var observeratlanticSignIn= new MutationObserverAtlantic(function(mutations, observer) {

          var atlanticSignInPresent = $(":contains(Already a subscriber?)").get(0);

          // password field has appeared
          if(atlanticSignInPresent) {
            var atlanticSignIn = $('a[href*="accounts.theatlantic.com/login/"]').get(0);
            atlanticSignIn.click();
            observeratlanticSignIn.disconnect();
            chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'atlantic'});
          }
        });

        observeratlanticSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });              
      	
      }
    }
  }
);

chrome.runtime.sendMessage({message: "loginRequestCredits"});
