console.log("LOADING HELPSCOUT PROGRAM");

//capture anything in the body of a message that looks like it might be an email address. 

let mainWork = {
  testMessage: "YOU ARE GREAT BUT GET BETTER",
  foundEmails: [],
  potentialEmails : function() {

    let mainBody = document.querySelector(".c-app-layout__block").innerText;
    
    //capture anything that looks like an email address
    let foundEmail = `${mainBody}`.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    
    this.foundEmails = foundEmail;
    
    //send that to the background.js script
    chrome.runtime.sendMessage({
      //capturedEmails: mainWork.potentialEmails,
      testMessage: mainWork.testMessage,
      foundEmails: mainWork.foundEmails
    }, (response) => {
      console.log(response);
    });
  
  }
}

//Start the show
mainWork.potentialEmails();


//When an ajax request is made and the page updates lets find more data. 
//Currently this doesn't work and we need to use a mutation observer instead. :) 
document.onreadystatechange = function () {
  if (document.readyState === "interactive") {

    mainWork.potentialEmails();

  }else{

    console.log("ready state not interactive ", document.readyState);

  }
}


//Make an ajax request

//send that data back to the content script

//inject the script into the helpscout page.