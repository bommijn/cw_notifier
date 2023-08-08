// popup.js

const checkboxOptionsPort = browser.runtime.connect({name:"checkbox"});


/**
 * restore the settings 
 */
function restoreOptions() {
    function setSettings(options) {
      let inputs = document.getElementsByTagName("input");      
      for(const input of inputs){
          let option = options[input.id];
          if(option == null) continue;
          console.log(option);
          let idInput = document.getElementById(option.id);
          idInput.checked = option.value;
          }
    }    
    function chosenSoundSelect(option){
      if(option != null){
        console.log("ioptoj", option.chosenSound);
        let select = document.getElementById("sounds");
        select.value = option.chosenSound;

      }

    }
    browser.storage.local.get(null).then(setSettings)
    browser.storage.local.get("userSoundName").then(userSoundSelectLabel)
    browser.storage.local.get("chosenSound").then(chosenSoundSelect)

  }


//on load
function onLoad(){
  
  restoreOptions();
  
  //listeners
  let inputs = document.getElementsByTagName("input");
  for(let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("change", saveOption);
  }
  
  document.getElementById('print').addEventListener("click",e => {
    browser.storage.local.get(null).then(x => console.log(x));
  });
  
  document.getElementById("sounds").addEventListener("onChange", e => {
    console.log(e);
  });

  document.getElementById("selectSound").addEventListener("click", e =>{
      let select = document.getElementById("sounds");
      browser.storage.local.set({chosenSound: select.value});
  });


}

//fired when clicking an option.
function saveOption(e){
  browser.storage.local.set({[e.srcElement.id]: { id:e.srcElement.id, value: e.srcElement.checked, type: "announcementOption"}});
  checkboxOptionsPort.postMessage({ id: e.srcElement.id, value: e.srcElement.checked, type: "announcementOption"});
}


/*
* init Listeners
*/
document.addEventListener("DOMContentLoaded", onLoad);

/**
 *  Updates the user uploaded sound label in the select box.
 * @param {Object{string userSoundName}} name 
 */
function userSoundSelectLabel(name){
  let userSound = document.getElementById("userSound");
  if(name["userSoundName"] != null){
    userSound.innerText = name["userSoundName"];
    userSound.disabled = false;
  }
  else
    userSound.disabled = true;

}

/*
 * sound functionallity
 */
const soundFileInput = document.getElementById('soundFileInput');
const saveSoundButton = document.getElementById('saveSoundButton');

// Function to handle the file selection and saving to browser.storage.local
function handleSoundFileSelection() {
  const file = soundFileInput.files[0];
  if (!file) 
    return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const dataUrl = event.target.result;
    // Save the data URL to browser.storage.local
    browser.storage.local.set({ userSoundName: file.name }).then(userSoundSelectLabel({ userSoundName: file.name }));
    browser.storage.local.set({ userSound: dataUrl });
    alert('Sound file uploaded and saved.');
  };

  // Read the file as data URL
  reader.readAsDataURL(file);
}

// Add event listener to the "Save Sound" button
saveSoundButton.addEventListener('click', handleSoundFileSelection);
