const port = browser.runtime.connect();

const audio = new Audio();
audio.addEventListener("canplay", (event) => {
  audio.play();

});
port.onMessage.addListener(function(event) {
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

