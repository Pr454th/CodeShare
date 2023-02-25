var timer = document.getElementById("timer");
var totalSeconds = 1200;

function setTime() {
  --totalSeconds;
  timer.innerHTML =
    pad(parseInt(totalSeconds / 60)) + ":" + pad(totalSeconds % 60);
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

// pasate text from clipboard to textarea on click
const content = document.getElementById("content");
content.addEventListener("click", function () {
  navigator.clipboard
    .readText()
    .then((text) => (content.value = text))
    .catch((err) => console.error("Failed to read clipboard contents: ", err));
});

const sendBtn = document.getElementById("send-btn");
const receiveBtn = document.getElementById("receive-btn");
const copyBtn = document.getElementById("copy-btn");

// action to be performed on clicking the send button
sendBtn.addEventListener("click", () => {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  // Generate a random 3-letter string
  let cid = "";
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    cid += letters[randomIndex];
  }
  // trim the textarea content to remove any extra spaces
  const cnote = document.getElementById("content").value.trim();
  const data = { id: cid, note: cnote };
  fetch("https://extension-iota.vercel.app/setnote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      const content = document.getElementById("content");
      const codeBlk = document.getElementById("code-blk");
      content.classList.add("d-none");
      codeBlk.classList.remove("d-none");
      document.getElementById("code").innerHTML = cid.toString();
      const intervalId = setInterval(setTime, 1000);
      setTimeout(() => {
        clearInterval(intervalId);
        content.classList.remove("d-none");
        codeBlk.classList.add("d-none");
      }, 1200000);
      response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
});

// action to be performed on clicking the receive button
receiveBtn.addEventListener("click", () => {
  // trim the input to remove any extra spaces
  const reqnum = document.getElementById("reqnum").value.trim();
  copyBtn.style.display="inline";
  fetch(`https://extension-iota.vercel.app/getnote/${reqnum}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("content").innerHTML = data.note[0].note;
    })
    .catch((error) => console.error(error));
});

//copy button action
copyBtn.addEventListener('click',()=>{
  navigator.clipboard
  .writeText(document.getElementById("content").value)
  .then(() => {
    // console.log(`Copied ${textToCopy} to clipboard`);
    copyBtn.className="btn btn-outline-success mb-2";
    copyBtn.innerText="Copied!";
  })
  .catch((err) => {
    console.error("Failed to copy text: ", err);
  });
})
