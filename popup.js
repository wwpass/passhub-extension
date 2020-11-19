
function contentScriptCb(result) {
    const lastErr = chrome.runtime.lastError;
    if (lastErr) {
      console.log(' lastError: ' + JSON.stringify(lastErr));
    }
}

let tabId;
let found = [];

const queryInfo = {
  active: true,
  currentWindow: true
};

function advItemClick(e) {
  console.log(this);
  console.log('----');
  console.log(e);
  console.log('----');
  const row = parseInt(this.getAttribute('data-row'));
  console.log(row);

  chrome.tabs.query(queryInfo, function(tabs) {
    tabId = tabs[0].id;
    chrome.tabs.executeScript(tabId, {
      code: `loginRequestJson = ${JSON.stringify(found[row])}`
    }, function() {
      chrome.tabs.executeScript(tabId, {file: 'contentScript.js'}, contentScriptCb)
    });
  });
}

document.querySelector('.close-popup').onclick = function (){
  window.close();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        if (request.id == 'advise') {
          const p = document.querySelector('#status-text');
          if (request.found.length) {
            p.innerText = 'Found:';
            const adviseList = document.querySelector('#advise');

            while (adviseList.firstChild) {
              adviseList.removeChild(adviseList.firstChild);
            }

            found = request.found;
            for (let i = 0; i < request.found.length; i++) {
              
              const d = document.createElement('div');
              d.setAttribute("data-row", `${i}`);
              d.setAttribute("class", "adv-item");
              d.onclick = advItemClick;

              const titleDiv = document.createElement('div');
              titleDiv.setAttribute("class", "entry-title");
              titleDiv.innerText = request.found[i].title;
              d.appendChild(titleDiv);

              const safeDiv = document.createElement('div');
              safeDiv.setAttribute("class", "entry-safe");
              safeDiv.innerText = request.found[i].safe;
              d.appendChild(safeDiv);

              adviseList.appendChild(d);
            }

          } else {
            p.innerHTML = `<p style='margin:30px 0'>No suitable accounts found for <br>${request.hostname}</p>`;
          }
        }
        return true;
    }
);

function activatePassHubTab() {

  const manifest = chrome.runtime.getManifest();
  const urlList = manifest.externally_connectable.matches;

  // chrome.tabs.query({url: ['https://passhub.net/*', 'http://localhost:8080/*:'] }, function(passHubTabs) {
  chrome.tabs.query({url: urlList }, function(passHubTabs) {
      if (passHubTabs && passHubTabs.length) {
      chrome.tabs.update(passHubTabs[0].id, {active: true})
    }  else {
      // no tabs permission
      window.open('https://passhub.net/', 'target="_blank"')
    }
  })
}

chrome.tabs.query(queryInfo, function(tabs) {
    const tab = tabs[0];
    tabId = tab.id;

    console.log('popup ' + tab.url);
    chrome.runtime.sendMessage({id: "popup opened", url: tab.url, tabId: tab.id},(reply) => {
        console.log(reply);
        const p = document.querySelector('#status-text');
        if(reply.response == 'not connected') {
            p.innerHTML = 'Please sign in to <a id="passhub_link" target="_blank">PassHub.net</a>';
            document.querySelector('#passhub_link').onclick = activatePassHubTab; 

        } else if(reply.response == 'Hi popup') {
            p.innerHTML = 'Connected';
        }
    });
});
