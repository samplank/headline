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
  // Send a message to the active tab
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   var activeTab = tabs[0];
  //   chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  //   startSignIn = true;
  // });
});

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {

  chrome.storage.sync.get(['credits'], function(result) {
    chrome.runtime.sendMessage({num_credits: result.credits});
  });


    // send message to active tab to begin sign in process, once it has loaded
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
        // signOutComplete = true;
      }

      if (currentSite == 'wapo') {
        chrome.tabs.create({url: 'https://www.washingtonpost.com/subscribe/signin/?action=signout', active: false}, function(tab){
            signOutTab = tab.id;
            // chrome.tabs.sendMessage(tab.id, {"message": "signOutWaPo"});
        });
        isLoggedIn = false;
        // signOutComplete = true;
      }

      if (currentSite == 'atlantic') {
        // chrome.tabs.create({url: 'https://accounts.theatlantic.com/accounts/details/', active: false});
        chrome.tabs.create({url: 'https://accounts.theatlantic.com/accounts/details/', active: false}, function(tab){
          // chrome.tabs.executeScript(tab.id, {file:"jquery.js"}, function() {
          //   chrome.tabs.executeScript(tab.id, {file:"enterSignIn.js"}, function() {
          //       chrome.tabs.sendMessage(tab.id, {message: "signOutAtlantic"});
          //   });
          // });
          signOutTab = tab.id;

        });
        isLoggedIn = false;
        // signOutComplete = true;
      }

    }
    // sign out of the Atlantic in the new tab
    if (changeInfo.status == "complete" && signOutTab == tabId) {
      if (currentSite == "nytimes") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutNYT"});
        SignOutTab = null;
        // signOutComplete = true;
      }

      if (currentSite == "wapo") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutWaPo"});
        // SignOutTab = null;
        // signOutComplete = true;
      }

      if (currentSite == "atlantic") {
        chrome.tabs.sendMessage(signOutTab, {"message": "signOutAtlantic"});
        // SignOutTab = null;
        // signOutComplete = true;
      }
    }

    // close the background logout tab
    if (changeInfo.status == "complete" && signOutComplete) {
      chrome.tabs.remove(signOutTab);
      signOutTab = null;
      signOutComplete = false;

    }




  }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    //start signin listener (from popup)
    if(request.message === 'popupButtonClicked') {
      console.log('popupButtonClicked received!')
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "clickLoginButton"});
        startSignIn = true;
      });
      chrome.storage.sync.get(['credits'], function(result) {
        console.log('Value currently is ' + result.credits);
        chrome.storage.sync.set({credits: result.credits - 1});
      });
    }

    if(request.message === "requestCredits") {
      chrome.storage.sync.get(['credits'], function(result) {
        chrome.runtime.sendMessage({num_credits: result.credits});
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
      signOutComplete = true;
    }
  }
);
