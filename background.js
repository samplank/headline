var startSignIn = false;
var inProgress = false;
var isLoggedIn = false;
var signOutComplete = false;
var isPaid = true;
var hasLicense;
var currentSite;
var signOutTab;
var userID;

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

    console.log('hastoken');

    var usersRef = firebase.database().ref('users');

    console.log(userID);

    firebase.database().ref().child("users").child(userID).on("value", function(snapshot) {

    // usersRef.once("value").then((snapshot) => {

      //check if it's a new user
      console.log(snapshot.val())
      if (!snapshot.val()) {
        console.log('doesnt exist')

        var credRef = firebase.database().ref('hash');

        //pull a set of credentials
        credRef.limitToFirst(1).once('value').then(snapshot => {
          var creds;
          snapshot.forEach(function(snapshot2) {
            creds = snapshot2.val();
          });


          //assign the credentials to the user
          firebase.database().ref('users/' + userID).set(
            {
              credentials: creds,
              credits: 5,
              credit_reloads: 0
            }
          )              
        });
      }
    });

    //background send number of credits
    chrome.browserAction.onClicked.addListener(function(tab) {
      var creditRef = firebase.database().ref('users/' + userID + '/credits');

      creditRef.once("value").then((snapshot) => {
        var val = snapshot.val();
        chrome.runtime.sendMessage({num_credits: val});
      });   
    });    


    chrome.tabs.onUpdated.addListener(
      function(tabId, changeInfo, tab) {

        var creditRef = firebase.database().ref('users/' + userID + '/credits');

        creditRef.once("value").then((snapshot) => {
          var val = snapshot.val();
          chrome.runtime.sendMessage({num_credits: val});
        });   

        // send message to active tab to begin sign in process, once it has loaded
        if ((currentSite == 'nyt' ||currentSite == 'wapo' || currentSite == 'atlantic' || currentSite == 'newyorker') && changeInfo.status == "complete" && startSignIn == true) {
          
          //get the login credentials and send them below

          var credentialRef = firebase.database().ref('users/' + userID + '/credentials/' + currentSite);

          credentialRef.once("value").then((snapshot) => {
            var val = snapshot.val();
            var auth_email = val.auth_email;
            var password = val.pass;
          });

          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

            var activeTab = tabs[0];

            var credentialRef = firebase.database().ref('users/' + userID + '/credentials/' + currentSite);

            credentialRef.once("value").then((snapshot) => {
              var val = snapshot.val();
              var auth_email = val.auth_email;
              var password = val.pass;

              chrome.tabs.sendMessage(activeTab.id, {"message": "start_sign_in", "auth_email": auth_email, "password": password});

            });

            chrome.tabs.sendMessage(activeTab.id, {"message": "start_sign_in"});
            isPaid = false;
          });
        }

        // logout in a background tab
        if (changeInfo.status == "complete" && isLoggedIn == true) {
          
          isLoggedIn = false;
          
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
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var activeTab = tabs[0];
              console.log(activeTab.id);
              console.log(activeTab);          
              chrome.tabs.sendMessage(activeTab.id, {"message": "signOutNewYorker"});
            });        
          }
        } 

        // sign out of the Atlantic in the new tab
        if (changeInfo.status == "complete" && signOutTab == tabId) {
          if (currentSite == "nyt") {
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
        //start signin listener (from popup)
        if(request.message === 'popupButtonClicked') {

          var newContributionKey = firebase.database().ref().child('users/' + userID + '/articles/').push().key;

          var updates = {};
          updates['users/' + userID + '/articles/' + newContributionKey] = request.article;

          var datRef = firebase.database().ref();
          datRef.update(updates);

          chrome.browserAction.setIcon({path: "icon_reading.png"});

          currentSite = request.site;

          // NYT doesn't load a new page, so send start_sign_in here
          if (currentSite == 'nyt' ||currentSite == 'wapo' || currentSite == 'atlantic' || currentSite == 'newyorker') {
            startSignIn = true;
          }

        }

        if(request.message === "popupRequestCredits") {

          var creditRef = firebase.database().ref('users/' + userID + '/credits');

          creditRef.once("value").then((snapshot) => {
            var val = snapshot.val();
            chrome.runtime.sendMessage({num_credits: val});
          });
        }

        if(request.message === "loginRequestCredits") {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];

            var creditRef = firebase.database().ref('users/' + userID + '/credits');

            creditRef.once("value").then((snapshot) => {
              var val = snapshot.val();
              chrome.tabs.sendMessage(activeTab.id, {num_credits: val, is_read: true});
            });
          });
        }

        if(request.message === "getMoreCredits") {

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


        if(request.message === "popupRequestAuthentication") {
          chrome.runtime.sendMessage({is_auth: 'authenticated'});

          var userRef = firebase.database().ref('users/' + userID);

          userRef.once("value").then((snapshot) => {
            if (snapshot.exists()) { 
               chrome.runtime.sendMessage({is_auth: 'exists user'});
            } else {
                chrome.runtime.sendMessage({is_auth: 'new user'});
            }
          });
        }

        if(request.is_credentials === true) {
          console.log(request);


          var licenseKey = request.license;

          checkNewLicense(licenseKey);

          // var licenseRef = firebase.database().ref('hash/' + request.license);


          // nyt_passRef.once("value").then((snapshot) => {
          //   var val = snapshot.val();
          //   firebase.database().ref('users/' + userID + '/credentials/nyt').set(
          //       {
          //           auth_email: request.nyt_login,
          //           pass: val
          //       }
          //     )
          // }); 

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
        if (isPaid == false && (request.site === "nytimesLogin" || request.site === "wapoLogin" || request.site === "atlanticLogin" || request.site === "newyorkerLogin")){
          firebase.database()
              .ref('users')
              .child(userID)
              .child('credits')
              .set(firebase.database.ServerValue.increment(-1),
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
                )
          isPaid = true;
        }
        if(request.logout === "success") {
          if (currentSite === 'nyt' || currentSite === 'wapo' || currentSite === 'atlantic') {
            chrome.tabs.remove(signOutTab, function() {
              signOutTab = null;
              startSignIn = false;
              chrome.browserAction.setIcon({path: "icon_background.png"});
            });
          } else if (currentSite === 'newyorker') {
            signOutTab = null;
            startSignIn = false;
            chrome.browserAction.setIcon({path: "icon_background.png"});        
          }
        }

      }
    );


  } //end of if (token)

  else {
    console.log('not authenticated');
    chrome.runtime.sendMessage({is_auth: 'not authenticated'});
  }

});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userID = user.uid

  } else {
    console.log('no user');
  }
});

if (!userID) {
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.message === "popupRequestAuthentication") {
          chrome.runtime.sendMessage({is_auth: 'not authenticated'});
        }
      }
    );
}


function checkExistingLicense() {
  
  var hasLicense;

  chrome.storage.sync.get("key", function (res) {
    if (typeof res.key === "undefined") {
      // unActivatedContainer.style.display = "block";
      console.log('Not found');
    } else {
      fetch("https://api.gumroad.com/v2/licenses/verify", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_permalink: "https://gumroad.com/l/cPZlx",
          license_key: res.key,
          increment_uses_count: false,
        }),
      })
        .then((res) => res.json())
        .then(function (data) {
          if (
            data.success &&
            data.purchase.refunded === false &&
            data.purchase.chargebacked === false
          ) {
            // activatedContainer.style.display = "block";
            hasLicense = true;
          } else {
            // unActivatedContainer.style.display = "block";
            hasLicense = false;

          }
        })
        .catch(function (err) {
          // unActivatedContainer.style.display = "block";
          hasLicense = false;
        });
    }
  });

  return hasLicense;

}

function checkNewLicense(licenseKey) {
  button.addEventListener("click", function () {
    
      fetch("https://api.gumroad.com/v2/licenses/verify", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_permalink: "https://api.gumroad.com/v2/licenses/verify",
          license_key: licenseKey,
          increment_uses_count: false,
        }),
      })
        .then((res) => res.json())

        .then(function (data) {
          if (
            data.success &&
            data.purchase.refunded === false &&
            data.purchase.chargebacked === false
          ) {
            chrome.storage.sync.set({ key: data.purchase.license_key });

            firebase.database().ref('users/' + userID + '/credits').set(
              50
            )

            //go to hash in the database and pull the first login credentials 







            checkExistingLicense();
          } else {
            // unActivatedContainer.style.display = "block";
            // errorMessage.style.display = "block";

          }
        })
        .catch(function (err) {
          // errorMessage.style.display = "block";

        });
    
  });
}

//--------------------------//
