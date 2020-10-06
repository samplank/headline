chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.message === "start_sign_in") {
      var auth_email = request.auth_email;
      var password = request.password;
      var currentArticle = request.current_article;

      if (location.href.includes("nytimes.com")) {

        var enterUsername = document.getElementById("username");
        var enterPassword = document.getElementById("password");
        var signIn = $('button:contains("Log In")').first();


        // username field has appeared
        if(enterUsername) {

          signInDetails(enterUsername, auth_email, enterPassword, password, signIn, clickSignIn);

          chrome.runtime.sendMessage({site: "nytimesLogin"});

        }
      }


      if (location.href.includes("washingtonpost.com")) {

        MutationObserverUser = window.MutationObserver || window.WebKitMutationObserver;

        var observerUser = new MutationObserverUser(function(mutations, observer) {
            // fired when a mutation occurs

            var enterUsername = document.getElementById("username");


            if(enterUsername) {
              observerUser.disconnect();

              enterUsername.setAttribute("value", auth_email);

              enterUsername.dispatchEvent(new Event("change", { bubbles: true }));

              var continueButton = $('button:contains("Continue")').first();
              continueButton.click();

              MutationObserverPass = window.MutationObserver || window.WebKitMutationObserver;

              var observerPass = new MutationObserverPass(function(mutations, observer) {

                var enterPassword = document.getElementById("password");
                var signIn = $('button')[1];

                if(enterPassword) {
                  observerPass.disconnect();
                  signInDetails(enterUsername, auth_email, enterPassword, password, signIn, clickSignIn);

                  chrome.runtime.sendMessage({site: "wapoLogin"});
                }


              });

              observerPass.observe(document, {
                subtree: true,
                attributes: true
                //...
              });

            }            
            // ...
        });

        // define what element should be observed by the observer
        // and what types of mutations trigger the callback
        observerUser.observe(document, {
          subtree: true,
          attributes: true
          //...
        });

      }

      if (location.href.includes("atlantic.com")) {
        var enterUsername = document.getElementById("username");
        var enterPassword = document.getElementById("password");
        var signIn = $('button')[1];
        signIn.disabled = false;
        if(enterUsername) {
          signInDetails(enterUsername, auth_email, enterPassword, password, signIn, clickSignIn);

          chrome.runtime.sendMessage({site: "atlanticLogin"});
        }
      }

      if (location.href.includes("newyorker.com")) {

        var enterUsername = document.getElementById("account-sign-in-page-form-text-field-email");
        var enterPassword = document.getElementById("account-sign-in-page-form-text-field-password");
        var signIn = $("button").get(3);
        // username field has appeared
        if(enterUsername) {
          signInDetails(enterUsername, auth_email, enterPassword, password, signIn, clickSignIn);

          chrome.runtime.sendMessage({site: "newyorkerLogin"});

        }
      }



    }

    if( request.message === "signOutNYT" ) { 

      var existsMasthead = document.getElementById("masthead-bar-one");

      if(existsMasthead) {
        chrome.runtime.sendMessage({logout: "success"});

      }

      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsLogIn = findElementbyTextContent('button', "Log in");

        if(existsLogIn) {
          observerSignOut.disconnect();

          chrome.runtime.sendMessage({logout: "success"});
        }

      });

      observerSignOut.observe(document, {
        subtree: true,
        attributes: true
        //...
      });

      setTimeout(function(){
         window.location.reload(1);
      }, 20000);

    }

    if( request.message === "signOutWaPo" ) { 

      var existsSignIn = Math.max($('button:contains("Sign in")').length, existsSignIn = $('button:contains("sign in")').length) !== 0;

      if(existsSignIn) {
        chrome.runtime.sendMessage({logout: "success"});
        location.reload();
      }

      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsSignIn = Math.max($('button:contains("Sign in")').length, existsSignIn = $('button:contains("sign in")').length) !== 0;

        if(existsSignIn) {
          observerSignOut.disconnect();

          chrome.runtime.sendMessage({logout: "success"});
          location.reload();
        }

      });

      observerSignOut.observe(document, {
        subtree: true,
        attributes: true
        //...
      });

      setTimeout(function(){
         window.location.reload(1);
      }, 5000);

    }

    if( request.message === "signOutAtlantic" ) {
      var signOut = $('button:contains("Sign out")').first();
      signOut.click();

      var existsUsername = document.getElementById("username");

      if(existsUsername) {
        wait(10000)
        chrome.runtime.sendMessage({logout: "success"});
      }


      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsUsername = document.getElementById("username");

        if(existsUsername) {
          observerSignOut.disconnect();
          wait(10000)
          chrome.runtime.sendMessage({logout: "success"});
          // location.reload();
        }

      });

      observerSignOut.observe(document, {
        subtree: true,
        attributes: true
        //...
      });

      setTimeout(function(){
         window.location.reload(1);
      }, 5000);

      //add mutation observer to see if the sign out is complete
    }

    if( request.message === "signOutNewYorker" ) {
      var signOut = $('button:contains("Sign out")').get(0);
      signOut.click();
      chrome.runtime.sendMessage({logout: "success"});

      //add mutation observer to see if the sign out is complete
    }

  }
);

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function findElementbyTextContent(eltype, text) {
  var buttons = document.querySelectorAll(eltype);
  for (var i=0, l=buttons.length; i<l; i++) {
    if (buttons[i].firstChild.nodeValue == text)
      return buttons[i];
  }  
}

function signInDetails(enterUsername, auth_email, enterPassword, password, signIn, callback) {
  enterUsername.value = auth_email
  enterUsername.dispatchEvent(new Event("change", { bubbles: true }));
  enterPassword.value = password
  enterPassword.dispatchEvent(new Event("change", { bubbles: true }));
  callback(signIn);
}

function clickSignIn(signIn) {
  signIn.click()
  setTimeout(() => {
    signIn.click()
  }, 500);
}







