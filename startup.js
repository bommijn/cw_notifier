let defaultValues = () => {
    //default storage values
    browser.storage.local.get("beepPath").then(e=>{
        if(e["beepPath"] == null){ browser.storage.local.set({beepPath: "sound/positive_beep.wav"});}
    });
    browser.storage.local.get("tokPath").then(e=>{
        if(e["tokPath"] == null){browser.storage.local.set({tokPath: "sound/tok.mp3"});}
    });
    browser.storage.local.get("chosenSound").then(e=>{
        if(e["chosenSound"] == null){browser.storage.local.set({chosenSound: "tokPath"});}
    });
}
defaultValues();