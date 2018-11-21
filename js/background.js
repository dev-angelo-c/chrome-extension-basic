var captureTabId = function(input){
  console.log(input);
  return input - 1;
};


/*chrome.tabs.getCurrent(function(){
  console.log(this.id);
  captureTabId(this.id);
});
*/

/*chrome.webNavigation.onDOMContentLoaded.addListener(function(captureTabId) {
  //console.log(change.status);
  console.log("Capture tab ID", captureTabId);
  chrome.tabs.executeScript(null,{file:"content.js"});
});*/

let capturedData = {

  emails: []

}


chrome.runtime.onMessage.addListener(
 
  function(request, sender, sendResponse) {
    
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    
    if (request){
      
      console.log("request: ", request.foundEmails);
      
      capturedData.emails = request.foundEmails;
      
      if(capturedData.emails.length > 0 ){
        sendResponse({capturedEmails: capturedData.emails });
      }else{
        sendResponse('found no emails to return to content script please check your code');
      }
    
    }else{

      console.log("what the fuck. No request found");

    }
  }
);

chrome.tabs.onRemoved.addListener( (tabId, removeInfo) => {  
  
});

