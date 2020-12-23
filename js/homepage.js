const { remote } = require('electron');
const settings  = getSettings();
const fs = require('fs');
const { inspect } = require('util');

const window = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

//form
const minimizeWindowBtn = document.getElementById('minimize');
const maximizeWindowwBtn = document.getElementById('maximize');
const closeWindowBtn = document.getElementById('close');

const form = document.getElementById("settingsForm");
const azureKeyInput = document.getElementById('azureKey');
const azureRegionInput = document.getElementById('azureRegion');

const punctuationCheckbox = document.getElementById('punctuationChkBx');
const profanityCheckbox = document.getElementById('profanityChkBx');

const maxWordsInput = document.getElementById('maxWords');
const clearTimeInput = document.getElementById('clearTime');
const bgColorSelect = document.getElementById('backgroundColor');
const customStyleInput = document.getElementById('customStyle');
const blacklsitWords = document.getElementById('blacklistWords')

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
        initSettings();
    }
};

// window.onbeforeunload = (event) => {
//     /* If window is reloaded, remove win event listeners
//     (DOM element listeners get auto garbage collected but not
//     Electron win listeners as the win is not dereferenced unless closed) */
//     window.removeAllListeners();
// }
// document.addEventListener('DOMContentLoaded', function() {
//     var elems = document.querySelectorAll('select');
//     var instances = M.FormSelect.init(elems);
//   });


function handleForm(event) { 
    event.preventDefault(); 
    saveSettings();
} 

function handleWindowControls() {
    minimizeWindowBtn.addEventListener("click", event => {
        window.minimize();
    });

    maximizeWindowwBtn.addEventListener("click", event => {
        if (!window.isMaximized()) {
            window.maximize();          
        } else {
            window.unmaximize();
        }
    });

    closeWindowBtn.addEventListener("click", event => {
        window.close();
    });

    form.addEventListener('submit', handleForm);
}

function initSettings() {
    azureKeyInput.value = settings.azureKey || '';
    azureRegionInput.value = settings.azureRegion || '';

    clearTimeInput.value  = settings.clearTimeSeconds || 4;
    maxWordsInput.value  = settings.maxWords || 150;

    punctuationCheckbox.checked = settings.autoPunctuation || true;
    profanityCheckbox.checked = settings.profanityFilter || true;

    bgColorSelect.value = settings.backgroundColor || '';
    customStyleInput.value = settings.customStlye || '';
    blacklsitWords.value = settings.blacklistWords || '';

    M.updateTextFields();
}

function saveSettings(){
    let newSettings = {
        ...settings
    }

    newSettings.azureKey = azureKeyInput.value;
    newSettings.azureRegion = azureRegionInput.value;

    newSettings.clearTimeSeconds = clearTimeInput.value;
    newSettings.maxWords = maxWordsInput.value;

    newSettings.autoPunctuation = punctuationCheckbox.checked;
    newSettings.profanityFilter = profanityCheckbox.checked;

    newSettings.backgroundColor = bgColorSelect.value;
    newSettings.customStlye = customStyleInput.value;

    newSettings.blacklistWords = blacklsitWords.value.replace(/\s/g, '');

    fs.writeFile(__dirname + '/settings.js', 'function getSettings() { return ' + inspect(newSettings) + '}', function (err) {
        if (err) throw err;
    });    
}