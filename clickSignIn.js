$(document).ready(function() {
  chrome.runtime.sendMessage({message: "loginRequestCredits"});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.is_read && request.num_credits > 0) {
      if (location.href.includes("nytimes.com")) {
        // var nytSignIn = document.getElementById('email');
          var nytSignIn = $('a[href*="https://myaccount.nytimes.com/auth/login?response_type=cookie&client_id=mpc&redirect_uri="]').get(0);
          console.log(nytSignIn);

           MutationObserverNYT = window.MutationObserver || window.WebKitMutationObserver;

            var observernytSignIn= new MutationObserverNYT(function(mutations, observer) {

              var nytSignIn = $('a[href*="https://myaccount.nytimes.com/auth/login?response_type=cookie&client_id=mpc&redirect_uri="]').get(0);


              // password field has appeared
              if(nytSignIn) {
                nytSignIn.click();
                observernytSignIn.disconnect();
                limiter(chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt', article: location.href}), 500);
              }
            });

            observernytSignIn.observe(document, {
              subtree: true,
              attributes: true
              //...
            });              






        // if (nytSignIn) {
        //   // chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt'});
        //   nytSignIn.click();
        //   limiter(chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt', article: location.href}), 500);
        // }
      } else if (location.href.includes("washingtonpost.com")) {
        // var wapoSignIn = $('a[href*="washingtonpost.com/subscribe/signin/"]').get(0);

        MutationObserverWaPo = window.MutationObserver || window.WebKitMutationObserver;

        var observerwapoSignIn= new MutationObserverWaPo(function(mutations, observer) {

          var wapoSignIn = document.getElementById('PAYWALL_V2_SIGN_IN');

          // password field has appeared
          if(wapoSignIn) {
            wapoSignIn.click();
            observerwapoSignIn.disconnect();
            chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'wapo', article: location.href});
          }
        });

        observerwapoSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });              

      } else if (location.href.includes("theatlantic.com")) {

        var atlanticSignIn = $(":contains(Already a subscriber?)").get(0);

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
            chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'atlantic', article: location.href});
          }
        });

        observeratlanticSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });              
      	
      } else if (location.href.includes("newyorker.com")) {

        MutationObserverNewyorker = window.MutationObserver || window.WebKitMutationObserver;

        var observernewyorkerSignIn= new MutationObserverNewyorker(function(mutations, observer) {

          var newyorkerSignInPresent = $(":contains(You’ve read your last complimentary article.)").get(0);

          // password field has appeared
          if(newyorkerSignInPresent) {
            var newyorkerSignIn = $('a[href*="https://account.newyorker.com/"]').get(0);
            newyorkerSignIn.click();
            observernewyorkerSignIn.disconnect();
            chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'newyorker', article: location.href});
          }
        });

        observernewyorkerSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });                           


      }
    }
  }
);

function limiter(fn, wait){
    let isCalled = false,
        calls = [];

    let caller = function(){
        if (calls.length && !isCalled){
            isCalled = true;
            calls.shift().call();
            setTimeout(function(){
                isCalled = false;
                caller();
            }, wait);
        }
    };

    return function(){
        calls.push(fn.bind(this, ...arguments));
        // let args = Array.prototype.slice.call(arguments);
        // calls.push(fn.bind.apply(fn, [this].concat(args)));

        caller();
    };
}
