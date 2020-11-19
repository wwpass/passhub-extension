'use strict';

let connected = false;
let passHubPort;

function cbGetCurrentTab(tab) {
  if(tab.length) {
    console.log(tab[0]);
    if (connected) {
      passHubPort.postMessage({id: 'find', url: tab[0].url});
    } else {
      console.log('Disco1')
    }
  }
}


// popup:

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  console.log(message);
  console.log(sender);
  if (message.id == "popup opened") {
      if(connected) {
        sendResponse({response: "Wait.."});
        passHubPort.postMessage({id: 'find', url: message.url});
      } else {
        sendResponse({response: "not connected"});
      }
  }
});

chrome.runtime.onConnectExternal.addListener((port) =>  {
  passHubPort = port;
  passHubPort.onDisconnect.addListener((port) =>  {
    console.log('disconnected');
    console.log(port);
    connected = false;
  });
  
  console.log('connected');
  console.log(passHubPort);
  connected = true;
  passHubPort.onMessage.addListener(function(message,sender){
    console.log('received');
    console.log(message);
  });
  passHubPort.onMessage.addListener(function(message,sender){
    console.log('received external ');
    console.log(message);
  });
});

function contentScriptCb(result) {
    const lastErr = chrome.runtime.lastError;
    if (lastErr) {
      console.log(' lastError: ' + JSON.stringify(lastErr));
    }
}

let loginRequest = {};

function tabCreated(aTab) {

  const lastErr = chrome.runtime.lastError;
  if (lastErr) { 
    console.log('tab: ' + tab.id + ' lastError: ' + JSON.stringify(lastErr));
  } else {
    // requires additional permission 
    /*
    chrome.tabs.executeScript(aTab.id, {
      code: `loginRequestJson = ${JSON.stringify(loginRequest)}`
    }, function() {
      chrome.tabs.executeScript(aTab.id, {file: 'contentScript.js'}, contentScriptCb)
    });
    */
  }
  
}

let farewellCount = 1;

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      console.log('request');
      console.log(request);
        console.log('sender');
        console.log(sender);
        if(request.id == 'loginRequest') {
          loginRequest = request;
          chrome.tabs.create({ url: request.url }, tabCreated);
        } else if (request.id == 'advise') {
          chrome.runtime.sendMessage(request);
        }
        sendResponse({farewell: `goodbye ${request.id} ${farewellCount}`});
        farewellCount++;
    }
);

chrome.tabs.onRemoved.addListener(
  function () {
    const lastErr = chrome.runtime.lastError;
    if (lastErr) {
      console.log(' lastError: ' + JSON.stringify(lastErr));
    } else {
      console.log('tab Removed');
    }
  }
);
