$(document).ready(function() {
  chrome.runtime.sendMessage({message: "loginRequestCredits"});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.is_read && request.num_credits > 0) {
      // createOverlay();
      if (location.href.includes("nytimes.com")) {

        var nytSignInClick = $('a[href*="https://myaccount.nytimes.com/auth/login?response_type="]').get(0);
        var isPaywall = document.getElementById("gateway-content");

        if(nytSignInClick && isPaywall) {
          nytSignInClick.click();
          limiter(chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt', article: location.href, nyt_flag: 'click_login'}), 500);             
          }

        MutationObserverNYT = window.MutationObserver || window.WebKitMutationObserver;

        var observernytSignIn = new MutationObserverNYT(function(mutations, observer) {

          var nytSignInClick = $('a[href*="https://myaccount.nytimes.com/auth/login?response_type="]').get(0);
          var isPaywall = document.getElementById("gateway-content");

          // password field has appeared
          if(nytSignInClick && isPaywall) {
            nytSignInClick.click();
            observernytSignIn.disconnect();
            limiter(chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'nyt', article: location.href, nyt_flag: 'click_login'}), 500);             
          }
        });

        observernytSignIn.observe(document, {
          subtree: true,
          attributes: true
          //...
        });              


      } else if (location.href.includes("washingtonpost.com")) {

        var wapoSignIn = document.getElementById('PAYWALL_V2_SIGN_IN');

        // password field has appeared
        if(wapoSignIn) {
          wapoSignIn.click();
          chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'wapo', article: location.href});
        }

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
        var freeArticlesRemaining = $(":contains(We hope you've enjoyed your free articles.)").get(0);

        MutationObserverAtlantic = window.MutationObserver || window.WebKitMutationObserver;

        var observeratlanticSignIn= new MutationObserverAtlantic(function(mutations, observer) {

          var atlanticSignInPresent = $(":contains(Already a subscriber?)").get(0);
          var freeArticlesRemaining = $(":contains(We hope you've enjoyed your free articles.)").get(0);

          // password field has appeared
          if(atlanticSignInPresent && freeArticlesRemaining) {
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
          
        var newyorkerSignInPresent = $(":contains(You’ve read your last complimentary article this month.)").get(0);

        // password field has appeared
        if(newyorkerSignInPresent) {
          var newyorkerSignIn = $('a[href*="account/sign-in"]').get(0);
          newyorkerSignIn.click();
          chrome.runtime.sendMessage({message: "popupButtonClicked", site: 'newyorker', article: location.href});
        }
        
        MutationObserverNewyorker = window.MutationObserver || window.WebKitMutationObserver;

        var observernewyorkerSignIn= new MutationObserverNewyorker(function(mutations, observer) {

          var newyorkerSignInPresent = $(":contains(You’ve read your last complimentary article this month.)").get(0);

          // password field has appeared
          if(newyorkerSignInPresent) {
            var newyorkerSignIn = $('a[href*="account/sign-in"]').get(0);
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
        caller();
    };
}

function findElementbyTextContent(eltype, text) {
  var buttons = document.querySelectorAll(eltype);
  for (var i=0, l=buttons.length; i<l; i++) {
    if (buttons[i].firstChild.nodeValue == text)
      return buttons[i];
  }  
}

function createOverlay() {
  var overlay = document.createElement("div");
  overlay.class = 'overlay';
  document.body.appendChild(overlay);                   
}

