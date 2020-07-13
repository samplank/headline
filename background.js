var startSignIn = false;
var isLoggedIn = false;
var signOutComplete = false;
var currentSite;
var signOutTab;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({credits: 10});
});

// click on the icon which will click the appropriate login button
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.sync.get(['credits'], function(result) {
      chrome.runtime.sendMessage({num_credits: result.credits});
    });
});

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {

  chrome.storage.sync.get(['credits'], function(result) {
    chrome.runtime.sendMessage({num_credits: result.credits});
  });


    // send message to active tab to begin sign in process, once it has loaded (for WaPo and Atlantic)
    if (changeInfo.status == "complete" && startSignIn == true) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "start_sign_in"});
        startSignIn = false;
      });
    }

    // logout in a background tab
    if (changeInfo.status == "complete" && isLoggedIn == true) {
      if (currentSite == 'nytimes') {
        chrome.tabs.create({url: 'https://myaccount.nytimes.com/auth/logout', active: false}, function(tab) {
          signOutTab = tab.id;
        });
        isLoggedIn = false;
      }

      if (currentSite == 'wapo') {
        chrome.tabs.create({url: 'https://www.washingtonpost.com/subscribe/signin/?action=signout', active: false}, function(tab){
            signOutTab = tab.id;
        });
        isLoggedIn = false;
      }

      if (currentSite == 'atlantic') {
        chrome.tabs.create({url: 'https://accounts.theatlantic.com/accounts/details/', active: false}, function(tab){
          signOutTab = tab.id;

        });
        isLoggedIn = false;
      }

    }
    // sign out of the Atlantic in the new tab
    if (changeInfo.status == "complete" && signOutTab == tabId) {
      if (currentSite == "nytimes") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutNYT"});

      }

      if (currentSite == "wapo") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutWaPo"});
      }

      if (currentSite == "atlantic") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutAtlantic"});
      }
    }
  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    //start signin listener (from popup)
    if(request.message === 'popupButtonClicked') {

      // NYT doesn't need to load a new page, so send start_sign_in here
      if (request.site == 'nyt') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {"message": "start_sign_in"});
        });
      }

      startSignIn = true;

      chrome.storage.sync.get(['credits'], function(result) {
        console.log('Value currently is ' + result.credits);
        chrome.storage.sync.set({credits: result.credits - 1});
      });
    }

    if(request.message === "popupRequestCredits") {
      chrome.storage.sync.get(['credits'], function(result) {
        chrome.runtime.sendMessage({num_credits: result.credits});
      });
    }

    if(request.message === "loginRequestCredits") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.storage.sync.get(['credits'], function(result) {
          chrome.tabs.sendMessage(activeTab.id, {num_credits: result.credits});
        });
      });
    }

    // logout listeners
    if(request.site === "nytimesLogin") {
      isLoggedIn = true;
      currentSite = 'nytimes';
    }
    if(request.site === "wapoLogin") {
      isLoggedIn = true;
      currentSite = 'wapo';
    }
    if(request.site === "atlanticLogin") {
      isLoggedIn = true;
      currentSite = 'atlantic';
    }
    if(request.logout === "success") {
      console.log('received logout success');
      console.log(signOutTab);
      chrome.tabs.remove(signOutTab);
      signOutTab = null;
    }

  }
);
