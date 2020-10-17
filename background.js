
var startSignIn = false;
var inProgress = false;
var isLoggedIn = false;
var signOutComplete = false;
var isPaid = true;
var hasLicense;
var currentSite;
var currentArticle;
var signOutTab;
var userID;
var userEmail;

var config = {
  apiKey: 'AIzaSyABp4MFCQRKq_rUFX4y2oUIMhpthxvIzH0',
  databaseURL: 'https://readr-d9acb.firebaseio.com',
  storageBucket: 'readr-d9acb.appspot.com'
};
firebase.initializeApp(config);


chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  firebase.auth().signInWithCredential(credential);
  if (token) {

    waitForUserID();

  }

  else {
    chrome.runtime.sendMessage({is_auth: 'not authenticated'});
  }

});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userID = user.uid
    userEmail = user.email;

  } else {
    console.log('no user');
  }
});

if (!userID) {
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.message === "popupRequestAuthentication") {
          if(firebase.auth().currentUser) {
            answerAuthentication(firebase.auth().currentUser.uid);
          } else {

            chrome.runtime.sendMessage({is_auth: 'not authenticated'});
          }
        }
      }
    );
}

function waitForUserID(){
  if(typeof userID !== "undefined"){
    checkIfNewUserandInitialize(userID);

    chrome.browserAction.onClicked.addListener(function(tab) {
      sendCredits(userID);
    });  

    chrome.tabs.onUpdated.addListener(
      function(tabId, changeInfo, tab) {

        sendCredits(userID);

        // send message to active tab to begin sign in process, once it has loaded
        if ((currentSite == 'nyt' || currentSite == 'wapo' || currentSite == 'atlantic' || currentSite == 'newyorker') && changeInfo.status == "complete" && startSignIn == true) {
          startSignIn = false;
          //get the login credentials and send them below
          var credentialRef = firebase.database().ref('users/' + userID + '/credentials/' + currentSite);

          credentialRef.once("value").then((snapshot) => {
            //get credentials
            val = snapshot.val();
            auth_email = val.auth_email;
            password = val.pass;
            //find active tab
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var activeTab = tabs[0];
              //send credentials to active tab
              chrome.tabs.sendMessage(activeTab.id, {"message": "start_sign_in", "auth_email": auth_email, "password": password, "current_article": currentArticle});
            });
          });

          isPaid = false;
        }

        if (changeInfo.status == "complete" && isLoggedIn == true) {
          isLoggedIn = false;
          startLogOut(currentSite);          
        }

        // finish the logout in the tab
        if (changeInfo.status == "complete" && signOutTab == tabId) {
          completeLogOut(currentSite)
        }

        if (changeInfo.status == "complete" && isLoggedIn == true) {

        }
      }
    );

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      //start signin listener (from popup)
      if(request.message === 'popupButtonClicked') {

        logArticle(userID, request.article);

        // chrome.browserAction.setIcon({path: "icon_reading.png"});
        chrome.browserAction.setBadgeText({ text: "READ" })

        currentSite = request.site;

        currentArticle = request.article;

        beginSignIn(request.site);
      }

      if(request.message === "popupRequestCredits") {
        sendCredits(userID);
      }

      if(request.message === "loginRequestCredits") {
        sendCreditsandReadApproval(userID);
      }

      if(request.message === "getMoreCredits") {
        increaseCredits(userID);
      }


      if(request.message === "popupRequestAuthentication") {
        answerAuthentication(userID);
      }

      if(request.message === "initiate_logout") {     
        isLoggedIn = false;
        startLogOut(currentSite);
      }

      if(request.message === "redirect_after_load") {
        redirectUrl = request.nav_url;
        isRedirect = true;
      } 

      if(request.is_credentials === true) {
        var licenseKey = request.license;
        isValidLicense(licenseKey);
      }

      // logout listeners
      if(request.site === "nytimesLogin") {
        isLoggedIn = true;
        currentSite = 'nyt';
      }
      if(request.site === "wapoLogin") {
        isLoggedIn = true;
        currentSite = 'wapo';
      }
      if(request.site === "atlanticLogin") {
        isLoggedIn = true;
        currentSite = 'atlantic';
      }
      if(request.site === "newyorkerLogin") {
        isLoggedIn = true;
        currentSite = 'newyorker';
      }
      if (isPaid == false && (request.site === "nytimesLogin" || request.site === "wapoLogin" || request.site === "atlanticLogin" || request.site === "newyorkerLogin")) {
        decrementValue(userID);
      }
      if(request.logout === "success") {
        finishLogout();
      }
    }
  );

  }
  else{
    setTimeout(waitForUserID, 100);
  }
} 

function isValidLicense(licenseKey) {

  //check if the license is of the right format
  const userKeyRegExp = /^[A-Z0-9]{8}\-[A-Z0-9]{8}\-[A-Z0-9]{8}-[A-Z0-9]{8}$/;
  const valid = userKeyRegExp.test(licenseKey);

  if (valid) {
    var licenseRef = firebase.database().ref('licenses/' + licenseKey);
    licenseRef.once("value").then((snapshot) => {
      if (snapshot.exists()) {
      } else {
        firebase.database().ref('users/' + userID + '/credits').set(
          50
        )

        firebase.database().ref('users/' + userID + '/status').set(
          'paid'
        )

        firebase.database().ref('users/' + userID + '/license').set(
          licenseKey
        )

        firebase.database().ref('users/' + userID + '/signUpTime').set(
          Date.now()
        )

        firebase.database().ref('users/' + userID + '/lastCreditRefresh').set(
          Date.now()
        )

        firebase.database().ref('licenses/' + licenseKey).set(
          true
        ) 
      }
    });
  }
}


function checkIfNewUserandInitialize(userID) {

  var userRef = firebase.database().ref('users/' + userID);

  userRef.once("value").then((snapshot) => {
    //check if it's a new user
    if (!snapshot.exists()) {

      var credRef = firebase.database().ref('hash');

      //pull a set of credentials
      credRef.orderByChild("count").limitToFirst(1).once('value').then(snapshot => {
        var credKey;
        var creds;
        snapshot.forEach(function(snapshot2) {
          credKey = snapshot2.key;
          creds = snapshot2.val().info;
        });


        //assign the credentials to the user
        firebase.database().ref('users/' + userID).set(
          {
            email: userEmail,
            credentials: creds,
            credits: 5,
            credit_reloads: 0,
            status: 'trial'
          }
        )

        firebase.database()
          .ref('hash')
          .child(credKey)
          .child('count')
          .set(firebase.database.ServerValue.increment(1))

      });
    } else {

      var val = snapshot.val();
      var d = new Date(val.lastCreditRefresh);
      var nextRefresh = d.setMonth(d.getMonth() + 1);
      var numReloads = val.credit_reloads

      if (Date.now() > nextRefresh) {
        var updates = {};
        updates['users/' + userID + '/lastCreditRefresh'] = nextRefresh;
        updates['users/' + userID + '/credits'] = 50;
        updates['users/' + userID + '/credit_reloads'] = val.credit_reloads + 1;

        var datRef = firebase.database().ref();
        datRef.update(updates);           
      }
    }
  });
}

function sendCredits(userID){
  var creditRef = firebase.database().ref('users/' + userID + '/credits');

  creditRef.once("value").then((snapshot) => {
    var val = snapshot.val();
    chrome.runtime.sendMessage({num_credits: val});
  });   
}

function startLogOut(currentSite) {
  if (currentSite == 'nyt') {
    chrome.tabs.create({url: 'https://myaccount.nytimes.com/auth/logout', active: false}, function(tab) {
      signOutTab = tab.id;
    });
  }

  if (currentSite == 'wapo') {
    chrome.tabs.create({url: 'https://www.washingtonpost.com/subscribe/signin/?action=signout', active: false}, function(tab){
        signOutTab = tab.id;
    });
  }

  if (currentSite == 'atlantic') {
    chrome.tabs.create({url: 'https://accounts.theatlantic.com/accounts/details/', active: false}, function(tab){
      signOutTab = tab.id;
    });
  }

  if (currentSite == 'newyorker') {
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //   var activeTab = tabs[0];        
    //   chrome.tabs.sendMessage(activeTab.id, {"message": "signOutNewYorker"});
    // });        
    chrome.tabs.create({url: 'https://www.newyorker.com/auth/end', active: false}, function(tab){
      signOutTab = tab.id;
    });
  }
}

function completeLogOut(currentSite) {
  if (currentSite == "nyt") {
    chrome.tabs.sendMessage(signOutTab, {"message": "signOutNYT"});
  }

  if (currentSite == "wapo") {
    chrome.tabs.sendMessage(signOutTab, {"message": "signOutWaPo"});
  }

  if (currentSite == "atlantic") {
    chrome.tabs.sendMessage(signOutTab, {"message": "signOutAtlantic"});
  }

  if (currentSite == "newyorker") {
    chrome.tabs.sendMessage(signOutTab, {"message": "signOutNewYorker"});
  }
}

function logArticle(userID, article) {
  var newContributionKey = firebase.database().ref().child('users/' + userID + '/articles/').push().key;

  var updates = {};
  updates['users/' + userID + '/articles/' + newContributionKey] = article;

  var datRef = firebase.database().ref();
  datRef.update(updates);
}

function beginSignIn(currentSite) {
  // NYT doesn't load a new page, so send start_sign_in here
    if ((currentSite == 'nyt') ||currentSite == 'wapo' || currentSite == 'atlantic' || currentSite == 'newyorker') {
      startSignIn = true;
    }
}

function sendCreditsandReadApproval(userID) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];

    var creditRef = firebase.database().ref('users/' + userID + '/credits');

    creditRef.once("value").then((snapshot) => {
      var val = snapshot.val();
      chrome.tabs.sendMessage(activeTab.id, {num_credits: val, is_read: true});
    });
  });
}

function increaseCredits(userID) {
  firebase.database()
      .ref('users')
      .child(userID)
      .child('credits')
      .set(firebase.database.ServerValue.increment(5),
        function(error) {
            if (error) {
              console.log(error);
            } else {
              var creditRef = firebase.database().ref('users/' + userID + '/credits');

              creditRef.once("value").then((snapshot) => {
                var val = snapshot.val();
                chrome.runtime.sendMessage({num_credits: val});
              });                      
            }
          }
          );

  firebase.database()
      .ref('users')
      .child(userID)
      .child('credit_reloads')
      .set(firebase.database.ServerValue.increment(1))
}

function answerAuthentication(userID) {
  var userRef = firebase.database().ref('users/' + userID);

  userRef.once("value").then((snapshot) => {
    if (snapshot.exists()) { 
      var status = snapshot.val().status;
      if (status === 'trial') {
       chrome.runtime.sendMessage({is_auth: 'trial user'});
      } else if (status === 'paid') {
        chrome.runtime.sendMessage({is_auth: 'paid user'});
      }
    } else {
      chrome.runtime.sendMessage({is_auth: 'not authenticated'});
    }
  });
}

function decrementValue(userID) {
  firebase.database()
    .ref('users')
    .child(userID)
    .child('credits')
    .set(firebase.database.ServerValue.increment(-1),
        function(error) {
          if (error) {
            console.log(error);
          } else {
            sendCredits(userID);                      
          }
        }
      )
  isPaid = true;
}

function finishLogout() {
  if (currentSite === 'nyt' || currentSite === 'wapo' || currentSite === 'atlantic' || currentSite === 'newyorker') {
    chrome.tabs.remove(signOutTab, function() {
      signOutTab = null;
      startSignIn = false;
      // chrome.browserAction.setIcon({path: "icon_background.png"});
      chrome.browserAction.setBadgeText({ text: '' })


    });
  } 
  // else if (currentSite === 'newyorker') {
  //   signOutTab = null;
  //   startSignIn = false;
  //   // chrome.browserAction.setIcon({path: "icon_background.png"});
  //   chrome.browserAction.setBadgeText({ text: '' })

  // }
}

//--------------------------//
