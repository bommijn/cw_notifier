//open the settings page into a new tab
function openOptionsPage() {
    browser.runtime.openOptionsPage();
  }
  
// Add a listener to execute when the browser action is clicked
browser.browserAction.onClicked.addListener((tab) => {
    openOptionsPage();
});

//load settings from the local storage and enable them
load = () => {
    let announcementItems = [];
    browser.storage.local.get(null).then(items => {
        for (const item of Object.entries(items)){
            if(item[1].type == "announcementOption")
                announcementItems.push(item[1]);
        }
        for(const item of announcementItems){
            processOption(item);
        }
    })
}
load();

  
/**
 * dict to keep track of which sound has played for which type.
 * Key = crimeType
 * value = timestamp of last announcement.
 */
let announcementDict = {};

// array of timestamp items that should trigger an announcement.
let notificationAnnouncements = [];
let soundAnnouncements = [];

//variable and place to connect the port from the content sctipt.
let portFromCS;
let settingsPort;

browser.runtime.onConnect.addListener((p) => {
    if(p.name == "checkbox"){
        settingsPort = p
        settingsPort.onMessage.addListener((event) =>{
            filterType(event)
        });
    }
    else{
        portFromCS = p;
    }
});


/**
 * Listener for the popup
 */
function filterType(event){
    switch(event.type){
        case "announcementOption":{
            processOption(event);
        }
    }
    console.log(soundAnnouncements);
    console.log(notificationAnnouncements);
}

/*
* handels the logic for announcementItems
*/
function processOption(event){
    let prefix = event.id[0];
    let eventName = translateOptionEvent(event.id.slice(1,event.id.length));
    let announcements = getAnnounements(prefix);
    if(event.value){
        announcements.push(eventName);
    }
    else{
        let index = announcements.findIndex(x => x == eventName);
        if(index != -1)
            announcements.splice(index, 1);
    }   
    console.log("not", notificationAnnouncements);
    console.log("Sound", soundAnnouncements);
}


/**
 * returns the list of announcements based on the prefix, sound or notification...
 */
function getAnnounements(prefix){
    if(prefix === "n")
        return notificationAnnouncements;
    else
        return soundAnnouncements;
}
/***
 * translates the option id from an option event, to the event name of camorra world
 */
function translateOptionEvent(eventName){
    console.log("Got event name", eventName);
    switch(eventName){
        case "KillP":
            return "kill_practice";
        
        case "Drive":
            return "driving_lesson"; 

        case "Fly":
            return "travel";            
    }
    return eventName.toLowerCase();
}

// Listen to the network request.... 
browser.webRequest.onBeforeRequest.addListener(
    handleCompletedRequest,
    { urls: ["https://www.camorraworld.com/apis/vip/index.php"] },
    ["blocking"]
);

// Event handler for onCompleted
function handleCompletedRequest(requestDetails) {
    getResponse(requestDetails.requestId);
}

function getResponse(id) {
    let filter = browser.webRequest.filterResponseData(id);
    filter.ondata = (event) => {
        let decoder = new TextDecoder("utf-8");
        let str = decoder.decode(event.data, { stream: true });
        parseIndexJson(str);
        filter.write(event.data);
    };

    filter.onstop = (event) => {
        filter.disconnect();
    };
}

function parseIndexJson(dataString) {
    console.log("doing response");

    let json = JSON.parse(dataString);
    let currentTimestamp = Math.floor(Date.now() / 1000);
    //loop over all timestamp entries 
    for (const [event, timestamp] of Object.entries(json.data.timestamps)) {
        let hasNotifiedForCurrent = announcementDict[event] != null && announcementDict[event] == timestamp;
        //check if we need to do an action
        if (timestamp < currentTimestamp &&
            !hasNotifiedForCurrent) {

            //add to dict so we dont repeat it for the same event.
            announcementDict[event] = timestamp;

            //handle sound
            if(soundAnnouncements.includes(event)){
               makeSound(event);
            }

            //handle notification
            if(notificationAnnouncements.includes(event)){
                makeNotification(event);
            }
        }
    }
    handleRanking(json);
}

function handleRanking(json){

    if(!soundAnnouncements.includes("rank") && !notificationAnnouncements.includes("rank"))
        return;
    let timeNow = Math.floor(Date.now() / 1000);
    let rankSkills = [json.data.timestamps["gta"], json.data.timestamps["crime"], json.data.timestamps["kill_practice"]]; 
    let hasNotifiedForCurrent = announcementDict["rank"] != null && announcementDict["rank"] < timeNow;
    //check if all timestamps have passed for the rankskills
    for(let time of rankSkills){
        if(time > timeNow)
        return;
    }
    if(!hasNotifiedForCurrent){
        if(soundAnnouncements.includes("rank"))
            makeSound("rank");
        if(notificationAnnouncements.includes("rank"))
            makeNotification("rank");

        announcementDict["rank"] = timeNow;
    }
}

function makeNotification(event){
    browser.notifications.create({
        type: "basic",
        title: " Action available",
        message: "Event: " + event + " is ready to be performed",
    });
}

function makeSound(event){
    portFromCS.postMessage(event);
}