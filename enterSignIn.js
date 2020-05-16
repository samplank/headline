chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if( request.message === "start_sign_in" ) {

      if (location.href.includes("nytimes.com")) {

        enterUsername = document.getElementById("email");

        // username field has appeared
        if(enterUsername) {

              enterUsername.setAttribute("value", "planetej@hotmail.com");

              enterUsername.dispatchEvent(new Event("change", { bubbles: true }));

              var continueButton = $('button:contains("Continue")').first();
              continueButton.click();

              MutationObserverPass = window.MutationObserver || window.WebKitMutationObserver;

              var observerPass = new MutationObserverPass(function(mutations, observer) {

                var enterPassword = document.getElementById("password");

                // password field has appeared
                if(enterPassword) {
                  observerPass.disconnect();
                  enterPassword.setAttribute("value", "news55boy");
                  enterPassword.dispatchEvent(new Event("change", { bubbles: true }));

                  var signIn = $('button:contains("Log In")').first();
                  signIn.click();
                  chrome.runtime.sendMessage({site: "nytimesLogin"});
                }
              });

              observerPass.observe(document, {
                subtree: true,
                attributes: true
                //...
              });              
        }
      }


      if (location.href.includes("washingtonpost.com")) {

        MutationObserverUser = window.MutationObserver || window.WebKitMutationObserver;

        var observerUser = new MutationObserverUser(function(mutations, observer) {
            // fired when a mutation occurs

            var enterUsername = document.getElementById("username");


            if(enterUsername) {
              observerUser.disconnect();

              enterUsername.setAttribute("value", "smgplank@gmail.com");

              enterUsername.dispatchEvent(new Event("change", { bubbles: true }));

              var continueButton = $('button:contains("Continue")').first();
              continueButton.click();

              MutationObserverPass = window.MutationObserver || window.WebKitMutationObserver;

              var observerPass = new MutationObserverPass(function(mutations, observer) {

                var enterPassword = document.getElementById("password");

                if(enterPassword) {
                  observerPass.disconnect();
                  enterPassword.setAttribute("value", "S@mman26");
                  enterPassword.dispatchEvent(new Event("change", { bubbles: true }));

                  var signIn = $('button')[1];
                  signIn.click();
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
          enterUsername.click();
          enterPassword.click();

          enterUsername.setAttribute("value", "samuel1hagen@gmail.com");
          enterUsername.dispatchEvent(new Event("change", { bubbles: true }));
          enterPassword.setAttribute("value", "baltimore");
          enterPassword.dispatchEvent(new Event("change", { bubbles: true }));
          signIn.click();
          chrome.runtime.sendMessage({site: "atlanticLogin"});
        }
      }

    }

    if( request.message === "signOutNYT" ) { 
      console.log('received signOutNYT')

      var existsMasthead = document.getElementById("masthead-bar-one");

      if(existsMasthead) {
        chrome.runtime.sendMessage({logout: "success"});
        console.log('existsMasthead')

      }

      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsMasthead = document.getElementById("masthead-bar-one");

        if(existsMasthead) {
          observerSignOut.disconnect();

          chrome.runtime.sendMessage({logout: "success"});
          console.log('existsMasthead')
          location.reload()
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

    if( request.message === "signOutWaPo" ) { 

      var existsSignIn = Math.max($('button:contains("Sign in")').length, existsSignIn = $('button:contains("sign in")').length) !== 0;

      if(existsSignIn) {
        chrome.runtime.sendMessage({logout: "success"});
        location.reload();
      }

      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsSignIn = Math.max($('button:contains("Sign in")').length, existsSignIn = $('button:contains("sign in")').length) !== 0;
        console.log(existsSignIn);

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
      console.log(signOut);
      signOut.click();

      var existsUsername = document.getElementById("username");

      if(existsUsername) {
        wait(5000)
        chrome.runtime.sendMessage({logout: "success"});
        location.reload();
        console.log('existsUsername')
      }


      MutationObserverSignOut = window.MutationObserver || window.WebKitMutationObserver;

      var observerSignOut = new MutationObserverSignOut(function(mutations, observer) {

        var existsUsername = document.getElementById("username");

        if(existsUsername) {
          observerSignOut.disconnect();
          wait(5000)
          chrome.runtime.sendMessage({logout: "success"});
          location.reload();
        }

      });

      observerSignOut.observe(document, {
        subtree: true,
        attributes: true
        //...
      });

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
