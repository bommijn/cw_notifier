const port = browser.runtime.connect();

const audio = new Audio();
audio.addEventListener("canplay", (event) => {
  audio.play();

});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getUsername") {
    sendResponse({ username: getUsernameFromInterface() });
  }
});


port.onMessage.addListener(function() {
  browser.storage.local.get("chosenSound").then(setting =>{
    browser.storage.local.get(setting.chosenSound).then(path =>{
      if(setting.chosenSound == "userSound")
        audio.src = path[setting.chosenSound];
      else  
        audio.src = browser.runtime.getURL(path[setting.chosenSound]);
      audio.play();  
    });
    });
    
  });


  function getUsernameFromInterface(){
    let iconElement = document.querySelector('i.ion-person');
    let text = iconElement.parentElement.textContent.trim();
    return text;
}
