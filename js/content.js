//object.observe commented out
// select the target node
/*var target = document;
//console.log(target);
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    //console.log(mutation.type);
  });    
});
 
// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);
 
// later, you can stop observing
observer.disconnect();*/


var $$ = function(id){
  return  document.getElementById(id);
};


let state = {
  counter: 0,
  loadedDebug: false,
  loadedRecurly: false,
  loadedRecurlySubscription: false,
  loadedWatson: false,
  loadedDashboard: false
};


let amazingData = {
  uuid:undefined,
  guid:undefined,
  createdAt: undefined,
  beginCapture: true,
  capturedEmail: "",
  capturedMessages: [],
  oldURL: location.href,
  subscriptionLink: "",

  composeMessage: document.getElementsByClassName("redactor_redactor redactor_editor")[0],
  storedSentences: [],

  //TODO: send a group of sentences to mongo :) 
  sendtoMongo: function(input){
    var key = config.mongokey;
    var mongoURL = "https://api.mlab.com/api/1/databases/mashme-v1/collections/convos?apiKey="+ key;
    //db.convos.insert({ "foo" : "bar" });
    console.log("input to mongo: " + input);
    var data = JSON.stringify( input );

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", mongoURL);
    xhr.onload = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          console.log(xhr.responseText);
        }
      }
    }

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("authorization", "Basic NTlhZjE0NmZjZTJjNjNlOTIwNTQzNjVkNmFiMDg3NTZlNDA1YTFkNDpY");
    xhr.setRequestHeader("cache-control", "no-cache");
    try{
      xhr.send(data);
    }catch(e){
      console.log("ERROR MONGO: " + e);
    }
  },

  //used to capture email from helpscout html and insert into recurly api call
  retrieveEmailFromTemplate: function(x){
    for(var i =0; i< x.length; i++){        
      var a = x[i].textContent.split(' ');        
      for(var j = 0; j< a.length; j++){          
        if(a[j].indexOf('@') > -1 && a[j].indexOf("support@ecquire.com") === -1){
          amazingData.capturedEmail = a[j].trim();
          amazingData.beginCapture = false
          return;
        }
      }
    }
  },

  //builds the recurly secion and adds the uuid and date account was created at into the injected html
  recurlySection: function(newUUID, created, actName){
    let parentSection = $$("apps");
    let x = document.getElementsByClassName("apps-history__data ui-sortable"); 
    
    console.log("x:  ", x, "typeof x: ", typeof x);

    if(parentSection && x && state.loadedRecurly === false){
      try{
        let xx = x;        
        //WHAT ARE WE CHECKING FOR HERE? 
        for(let i of xx){
          if(i.textContent.trim().indexOf("Recurly") === -1){
            state.loadedRecurly = false;
          }else{
            state.loadedRecurly = true;      
          }
        };

        let newCSApp = document.createElement("div");
        
        newCSApp.className = "sidebar-app open recurlySection";
        newCSApp.id = "recurly";
       
        let insertRecurlyAccountURL = 'https://ecquire.recurly.com/accounts/' + amazingData.capturedEmail;
        let postponeLink = amazingData.postponeLink;
          //thefollowing relies on a solid newUUID parameter being passed
        newCSApp.innerHTML = "<section class='sidebar-app homebrew'>" +
          "<h3 class='bar app open' data-collapse-summary='' aria-expanded='true'>" +
          "<a href='#'>Recurly<b class='caret'></b></a></h3>" +
          "<section class='content' aria-hidden='false' style='border-bottom-width: 0px;'>" +
          "<h5>Billing Profile</h5>" +
          "<p class='muted'>Last Billed: Enter Date here</p>" +
          "<p class='beganSub'>Created: "+ created +" </p>" +
          "<div class='toggleGroup open'>" +
          "<h4><a href='#' class='toggleBtn'>" +
          "<i class='icon-arrow'></i>Recurly uuid:</a></h4>" +
          "<div class='toggle' style='display: block'>" +
          "<ul><li>Name:"+actName+"</li>" +
          "<li>"+newUUID+"</li>" +
          "<li><a target='_blank' href=" + insertRecurlyAccountURL + ">Account Link</a></li>" +
          "<li><a target='_blank' href=" + postponeLink + ">Postpone Link</a></li></ul>" +
          "</div>" +
          "</div>";

        parentSection.appendChild(newCSApp);
        
        state.loadedRecurly = true;

        ////console.log(state.readyToRemove());
      
      }catch(e){
        state.loadedRecurly = false;
        console.log("error building recurly: ", e);
        console.trace();
      }
    }else{
      console.log("NO PARENT SECTIONS AVAILABE TO CREATE.")
    }
  },

  //call watson :) 
  ibmXhr: function(){
    try{      
      var getSubjectline = document.getElementById('subjectLine') || document.getElementById('tktSubject');
      var breakSubjectline = getSubjectline.innerText.split(' ');
      var analyzeCapture = document.getElementsByClassName('messageBody');

      if(breakSubjectline[0].toLowerCase() == "bug"){
        if(breakSubjectline[1].toLowerCase() == "report"){
          console.log(" Don't ask Wastson what to do because it is a bug report " + breakSubjectline);
          state.loadedWatson = false;
          return;
        }
      }

      if(state.loadedWatson === false && state.counter <= 1){        
        console.log('analyzeCapture i.e. messageBody ')//, analyzeCapture );
        let analyzeThis = analyzeCapture[0].innerText;
        let data = "{\"text\":"+ analyzeThis +"}";
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        
        setTimeout( () => {
          xhr.open("POST", "https://gateway.watsonplatform.net/tone-analyzer-beta/api/v3/tone?version=2016-02-11", true);
          xhr.onload = function(){
            if(xhr.readyState === 4){
              if(xhr.status === 200){                
                console.log("Watson call successful");
                var sendWatsonSomewhere = xhr.responseText;
                state.loadedWatson = true;           
              }
            }
          }
          xhr.setRequestHeader("authorization", config.ibmkey);
          xhr.setRequestHeader("cache-control", "no-cache");
          xhr.send(data);

        }, 1200);
      }
      state.loadedWatson = true;
    }catch(e){
      state.loadedWatson = false;
      console.log("Watson not called because ", e);
    }
  },
  /*
    var toneRequest = new XMLHttpRequest();

    //capture text of editor.
    var captureText = function(){
      var editor = document.getElementsByClassName("redactor_redactor redactor_editor")[0];
      var editorText = editor.textContent;
      var tryThisText = editorText.toString();
      return {"text": tryThisText};
    };
    //begin XHR request
    toneRequest.open("POST", "270f7080-c28e-4cf1-844a-35d8ba388753:Abqi4qsAkVQE@https://gateway.watsonplatform.net/tone-analyzer-beta/api/v2/tone?version=2016-02-11", true);
    toneRequest.setRequestHeader("Accept", 'application/json');
    toneRequest.setRequestHeader("Content-Type", "application/json charset = utf - 8");
    toneRequest.setRequestHeader("Authorization", "Basic");
    //'Content-Type'  :'application/json', X-synctimeout' : syncTimeout, 'Authorization' : "Basic " + new Buffer(username+":"+passwd).toString("base64")};
    toneRequest.onload = function(){
      if (toneRequest.readyState === 4) {

        if (toneRequest.status === 200) {

          console.log(toneRequest.responseText);
      
        }
      }
    };
    toneRequest.onerror = function (e) {
      console.error(toneRequest.statusText);
    };
    
    try{
      toneRequest.send({'text':'this is the greatest app ever created. I am so excited to be a part of this project. Would you call me at your earliest convenience?'});
    }catch(e){
      console.log("R3quest likely not valid: " + e);
    }
    console.log("end request function line 122: ");

     //how do we handle the JSON payload?//
  */
  //watson message passing
  /*
    //console.log("Try sending Watson somewhere");
    chrome.runtime.sendMessage(sendWatsonSomewhere, function(response) {
      //console.log(response);
    });
  */ 
  xhrRecurly: () => {
    console.log("begin xhrRecurly");
    if(location.href.indexOf("https://secure.helpscout.net/conversation/") > -1){
      amazingData.retrieveEmailFromTemplate([document.getElementById("subjectLine"), document.getElementsByClassName("contactInfo")[0]])
      amazingData.beginCapture = true; 
    }else{
      amazingData.beginCapture = false;
    }
    
    if(amazingData.beginCapture === false && state.loadedRecurly === false){      
     
      if(amazingData.capturedEmail){
        try{
          let recurlyAccountRequest = new XMLHttpRequest();
          let setKey = config.recurlyKey;
          recurlyAccountRequest.open("GET", "https://ecquire.recurly.com/v2/accounts/" + amazingData.capturedEmail, true, setKey, "");
          //recurlyAccountRequest.setRequestHeader("Authorization", "Basic " + window.btoa('04bd9738a7d54bdca64f4a7400f3f5cb'));
          recurlyAccountRequest.setRequestHeader("Accept", 'application/xml');
          recurlyAccountRequest.setRequestHeader("Content-Type", "application/xml charset = utf - 8");
          recurlyAccountRequest.onload = () => {
            //amazingData.uuid = recurlyAccountRequest.responseXML.getElementsByTagName('hosted_console.login_token')[0].innerHTML;
            if(location.href.indexOf("https://secure.helpscout.net/conversation/")!==-1){
              if(recurlyAccountRequest.status === 200){ 
                amazingData.uuid = recurlyAccountRequest.responseXML.getElementsByTagName('hosted_login_token')[0].innerHTML;
                amazingData.createdAt = recurlyAccountRequest.responseXML.getElementsByTagName('created_at')[0].innerHTML;
                amazingData.accountName = recurlyAccountRequest.responseXML.getElementsByTagName('first_name')[0].innerHTML + " " + recurlyAccountRequest.responseXML.getElementsByTagName('last_name')[0].innerHTML;
                amazingData.subscriptionLink = recurlyAccountRequest.responseXML.getElementsByTagName('subscriptions')[0];            
                amazingData.recurlySection(amazingData.uuid, amazingData.createdAt, amazingData.accountName, amazingData.postponeLink);
                state.loadedRecurly = true;
                if(state.loadedRecurly === true && amazingData.subscriptionLink.length !== -1 && state.loadedRecurlySubscription === false){
                  var getSubscriptionData = function(input){
                    var gSubD = new XMLHttpRequest();                      
                      gSubD.onload = function(){
                        if(gSubD.readyState === 4){
                          if(gSubD.status === 200){
                            console.log(["GOT SUBSCRIPTION PRINTING...", gSubD]);
                            var testXX = gSubD.responseXML;
                            console.log(["Apply Postpone link to amazingData?", testXX]);
                            //amazingData.postponeLink = testXX.getElementsByTagName("a")[2].attributes[1].nodeValue;                              
                            //console.log(amazingData.postponeLink);
                          }
                        }
                      }
                    state.loadedRecurlySubscription = true;
                    gSubD.open("GET", input, true);
                    gSubD.send();
                  }
                  getSubscriptionData(amazingData.subscriptionLink.getAttribute('href'));
                }else{
                  console.log("Setting recurly status to true because it is likely an unfindable account: ", recurlyAccountRequest.status);
                  state.loadedRecurly = true;
                  state.loadedRecurlySubscription = true;
                }
              }
            }
          }
          recurlyAccountRequest.send();
        }catch(e){
          console.log("Error is: ", e );
        }
      }
    }
  },

  //create a debug link.
  createBugReportLink: () => {
    /*
      var x = document.getElementsByClassName("sidebar-app homebrew");
        if(x.length !== 0 || x!==""|| x!==undefined){
          for(var i = 0; i< x.length; x++){

            if(x[i].textContent.trim().indexOf("Debug Link") === -1){
              
              state.loadedDebug = false;

              //console.log(state.loadedDebug);

            }else{

              state.loadedDebug = true;

              //console.log(state.loadedDebug);

              break;
            }
          }
        }else{
          //console.log("no sidebar-app sections found");
        }
    */
    if(state.loadedDebug === false){
      try{
        let x = document.getElementsByClassName("apps-history__data ui-sortable")[0];     
        let getGuid = $$("subjectLine").textContent.split(" ");      
        let parentSection = $$("apps");        
        if(parentSection){        
          var newCSApp = document.createElement("div");
          let gotGuid = 'https://ecquire-dev.herokuapp.com/logging?guid=' + getGuid[getGuid.length-1];          
          var buildDebugHTML = () => {
            newCSApp.innerHTML = "<section class='sidebar-app homebrew' id='debugObj'>" +
                "<h3 class='bar app open' data-collapse-summary='' aria-expanded='true'>" +
                "<a href='#'>Debug Link<b class='caret'></b></a></h3>" +
                "<section class='content' aria-hidden='false' style='border-bottom-width: 0px;'>" +
                "<h5>Bug Report HTML</h5>" +
                "<div class='toggleGroup open'>" +
                "<h4><a href='#' class='toggleBtn'>" +
                "<div class='toggle' style='display: block'>" +
                "<ul>"+
                "<li>" +
                "<a target='_blank' href=" + gotGuid+">Debug Link</a>" +
                "</li>" +
                "</ul> "+
                "</div>" +
                "</div>";
          };
          newCSApp.className = "sidebar-app open recurlySection";
          newCSApp.id = "recurly";
        }else{ 
          console.log(" no newCSApp ")
        }

        buildDebugHTML();
        parentSection.appendChild(newCSApp);
        state.loadedDebug = true;
      }catch(e){
        console.log("ERROR IN DEBUG BUILD SECTION ", e);
        console.trace();
      }
    }else{
      console.log("Debug link exists exiting build the debug section", $$("apps"));
    }
  },
  //examine response text to auto complete commonly used phrases.
  storeSentences: function(){
    var complete = false;
    var editor = amazingData.composeMessage;
    //console.log("editor found? " + editor);
    if(editor){
      var editorText = editor.textContent.split('. ');
    };
    var dateNow = new Date();
    var batch = {
      date: dateNow,
      data: editorText,
      usages: 0
    };
    amazingData.storedSentences.push(batch);
    //console.log(amazingData.storedSentences);
    //Lets use this later on
    /*storedSentences.favorites = {
      first:[],
      second: [],
      third: []
    }*/
    return amazingData.storedSentences;
  },
  
  addPreTypedMessage: function(){
  },

  addStoredLink: function(){
    if(editorText.indexOf("clicking here") >=0 || editorText.indexOf("Can you please send a bug") >=0 ){
      //console.log(" This should not be firing without one of those two phrases")
      //console.log(" Review indexOf documentation");
      console.log("DO YOU WANT TO ADD A LINK NOW?");
      console.log("Review us in Chrome link: http://bit.ly/1JMvTGF");
      console.log("Dashboard help docs: http://bit.ly/1Qi81H7");
      console.log("Download from Chrome Store: http://bit.ly/downECQ");
      console.log("Salesforce LinkedinDemo : http://bit.ly/1Ii34kC");
      //console.log(editorText);
    }else {
      console.log("NOTHING FOUND ")
      return;
    }//
  }

};

var setStateFalse = function(){
  
  if(amazingData.oldURL != location.href){
    amazingData.capturedEmail = "";
    state.loadedWatson = false;
    state.loadedDebug = false;
    state.loadedRecurly = false;
    state.loadedRecurlySubscription = false;
    console.log("False flags set for all rmEvListener properties");
  }  

};

var checkState = function(event){

  console.log("in checkState: ", event);

  if($$('debugObj') || $$('recurlyData')){
    clearInterval(begin);
  }else{
    console.log("1. Create Debug");
    amazingData.createBugReportLink();

    if(amazingData.capturedEmail === false){
      console.log("2. Begin Capture Email")    
      amazingData.retrieveEmailFromTemplate();
    };

    if(state.loadedWatson === false){
      console.log("3. Begin Watson Evaluation")
      amazingData.ibmXhr();
    };

    if(state.loadedRecurly === false){
      console.log("4. Call recurly API")
      amazingData.xhrRecurly();
    };
    console.log("clearing Interval")
    clearInterval(begin);
    //not an api
    /*if(state.loadedDashboard === false){
      console.log("5. Load Dashboard information from API");
      amazingData.dashboardXhr('jack');
    }*/
  }

};

document.addEventListener('click', () => {
  console.log("CLICK");
  begin = setInterval(checkState, 1400);
});

//TODO: Build a function that captures all of the same
// data for building a section in the proper place.

window.addEventListener('unload', () => {
  console.log("UNLOAD");
  clearInterval(begin);
});

/*
  var container = document.createElement("div");
  container.style = "height: 100px;width: 100px;border: 1px solid #CCCCCC;border-radius: 20px;bottom: 54px;right: 0;position: fixed; margin-right: 14px;text-align: center;"
  container.innerHTML = "<p id='upArrow' style='font-size: 70px; margin-top: 0px;'>^</p>"
  document.body.appendChild(container);
*/

//EXTRA's FOR LATER

/*

  chrome.runtime.sendMessage(currentURL.initialURL, function(response) {
    console.log("Sending Message from content Script Awaiting response ");
    console.log("Response ", response);
    
  });

  chrome.runtime.onMessage.addListener(function(request, sender, response){
    console.log(request);
    console.log(" sender, " + sender);// + " response, " + response);
    console.log("using sender tab, " + sender.tab.url);
    console.log("data response from IBM to send to ChartJS: " );
    response("CONTENT HEARD REQUEST RESPONDING NOW");
  });

  //Object.observe(amazingData, amazingData.foundUUID()); 

*/