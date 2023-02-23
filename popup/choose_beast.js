/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = ``;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
var timer = document.getElementById("timer");
var totalSeconds = 1200;

function setTime() {
  --totalSeconds;
  timer.innerHTML = pad(parseInt(totalSeconds / 60))+":"+pad(totalSeconds % 60);
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}
const button = document.getElementById('content');
button.addEventListener('click', function() {
  // Code to execute when the button is clicked
  console.log('Button clicked');
  navigator.clipboard.readText()
  .then(text => {
    // Do something with the text
    document.getElementById("content").value=text;
  })
  .catch(err => {
    console.error('Failed to read clipboard contents: ', err);
  });
});

function listenForClicks() {
  const content=document.getElementById("content");
  document.addEventListener("click", (e) => {
    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function beastNameToURL(beastName) {
      switch (beastName) {
        case "Send":
            // const cid= Math.floor(Math.random() * (999999 - 111111 + 1) + 111111);

            // Define an array of all possible letters
            const letters = "abcdefghijklmnopqrstuvwxyz".split("");

            // Generate a random 3-letter string
            let cid = "";
            for (let i = 0; i < 3; i++) {
              const randomIndex = Math.floor(Math.random() * letters.length);
              cid += letters[randomIndex];
            }

            const cnote=document.getElementById("content").value;
            const data = {id:cid, note: cnote}
            fetch('https://extension-iota.vercel.app/setnote', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
            })
              .then(response => {
                console.log("response");
                const content=document.getElementById("content");
                const codeBlk=document.getElementById("code-blk");
                content.style.display='none';
                codeBlk.style.display='block';
                document.getElementById("code").innerHTML=cid.toString();
                const intervalId = setInterval(setTime, 1000);
                totalSeconds=1200;
                setTimeout(() => {
                  clearInterval(intervalId);
                  content.style.display="block";
                  codeBlk.style.display="none";
                },  1200000);
                response.json();})
              .then(data =>
                console.log(data))
              .catch(error => console.error(error));
            
        case "Receive":
          const reqnum=document.getElementById("reqnum").value;
          fetch(`https://extension-iota.vercel.app/getnote/${reqnum}`)
          .then(response => response.json())
          .then(data => {document.getElementById("content").innerHTML=data.note[0].note;
                        navigator.clipboard.writeText(document.getElementById("content").value)
                          .then(() => {
                            console.log(`Copied ${textToCopy} to clipboard`);
                          })
                          .catch(err => {
                            console.error('Failed to copy text: ', err);
                          });          
                        console.log(data);})
          .catch(error => console.error(error))
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function beastify(tabs) {
      browser.tabs.insertCSS({ code: hidePage }).then(() => {
        let url = beastNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "beastify",
          beastURL: url,
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({ code: hidePage }).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not be used in New tab: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (e.target.type === "reset") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(beastify)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "../beastify.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
