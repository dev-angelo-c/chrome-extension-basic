/*! Raygun4js - v2.3.1 - 2016-04-13
* https://github.com/MindscapeHQ/raygun4js
* Copyright (c) 2016 MindscapeHQ; Licensed MIT */

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


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  console.log("Evaluate the three parameters of onMessage listener in BG");
  console.log(response);

  console.log(sender.tab.id)

  console.log(sender);

  sendResponse("I think the BG heard watson talk");

});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
  //alert("!! Exiting the Browser !! " + tabId);
  //console.log(removeInfo);
  //console.log(tabId);
  var exited = new Date();
  timeDifference.timeExited = exited.getTime();
  myFirebaseRef.orderByChild('tID').equalTo(tabId).on('value', function(snapshot) {

    console.log(snapshot.val());

    console.log(timeDifference.timeExited - timeDifference.timeEntered + " For Tab id :" + tabId);
  });
});

