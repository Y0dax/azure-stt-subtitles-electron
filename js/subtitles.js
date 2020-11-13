(e => {
    'use strict';
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Settings (Enter info here)
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    const azureCognitionSubscriptionKey = ''; //Subscription key from Azure Cognitive Services
    const azureRegion = ''; //An azure region string (westeurope, eastus, etc)


    const backgroundColor = 'blue';            // Set background color of window. Accepts color names or Hex examples: 'Red' '#000000' For all possible values see: https://www.w3schools.com/cssref/css_colors_legal.asp
    const clearTime = 4;                // Seconds
    const maxWords = 250;              // Max words to show on the screen
    const autopunctuation = true;             // At the end of a phase, punctuation such as periods or qustion marks are automatically added using AI.
    let subtitleStyle = '';               // Accepts css styles
    const autoShutoffTime = 15 * 60 * 1000;   // Connection to the STT service will close to save cost.


    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LOGIC
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    var SpeechSDK;
    var recognizer;
    var idleTimeout;
    var connectTimeout;
    var subtitles = document.querySelector('#subtitle');
    var connectBtn;
    var disconnectBtn;

    document.body.style.backgroundColor = backgroundColor;
    document.addEventListener("DOMContentLoaded", function () {
        connectBtn = document.getElementById("connect");
        disconnectBtn = document.getElementById("disconnect");
        disconnectBtn.disabled = true;
        if (!!window.SpeechSDK)
            SpeechSDK = window.SpeechSDK;

        // document.getElementById("close").addEventListener("click", () => {
        //     app.BrowserWindow.getFocusedWindow().close();
        // }, false);

        connectBtn.addEventListener("click", function () {
            var speechConfig;
            try {
                speechConfig = SpeechSDK.SpeechConfig.fromSubscription(azureCognitionSubscriptionKey, azureRegion);
            }
            catch(err){
                subtitles.innerHTML = 'Connection refused. Please check subscription key + region and reconnect.';
            }

            speechConfig.enableDictation();
            speechConfig.speechRecognitionLanguage = "en-US";
            if (autopunctuation !== true)
                speechConfig.setServiceProperty('punctuation', 'explicit', SpeechSDK.ServicePropertyChannel.UriQueryParameter);
            var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

            recognizer.recognizing = (s, e) => {
                //console.log(`RECOGNIZING: Text=${e.result.text}`);
                updateSubtitles(e.result.text, true);
                if (idleTimeout) {
                    clearTimeout(idleTimeout);
                    idleTimeout = null;
                }
                idleTimeout = setTimeout(function () {
                    recognizer.stopContinuousRecognitionAsync();
                    connectBtn.disabled = false;
                    disconnectBtn.disabled = true;
                }, autoShutoffTime);
            };

            recognizer.recognized = (s, e) => {
                //console.log(`RECOGNIZED: Text=${JSON.stringify(e.result)}`);
                if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) {
                    updateSubtitles(e.result.text, false);
                };
            };

            recognizer.canceled = (s, e) => {
                // console.log(`CANCELED: Reason=${e.reason}`);

                // if (e.reason == CancellationReason.Error) {
                //     console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                //     console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                //     console.log("CANCELED: Did you update the subscription info?");
                // }

                recognizer.stopContinuousRecognitionAsync();
                subtitles.innerHTML = 'Connection refused. Please check subscription key + region and reconnect.';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
            };

            recognizer.sessionStopped = (s, e) => {
                recognizer.stopContinuousRecognitionAsync();
                subtitles.innerHTML = 'Connection closed or timed out - Please reconnect.';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
            };

            recognizer.sessionStarted = (s, e) => {
                if (connectTimeout) {
                    clearTimeout(connectTimeout);
                    connectTimeout = null;
                }
                subtitles.innerHTML = 'Connected - Start Talking';
            };

            // Set Styles of Subtiltle Text
            updateSubtitleStyle(subtitleStyle);

            connectTimeout = setTimeout(function () {
                subtitles.innerHTML = 'Unable to connect - network issue or unable to gain microphone access.';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
            }, 15000);

            disconnectBtn.addEventListener("click", function () {
                recognizer.stopContinuousRecognitionAsync();
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
            });

            recognizer.startContinuousRecognitionAsync();
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;

        });

    });

    function updateSubtitleStyle(style) {
        subtitles.style = style;
    }

    function updateSubtitles(speech, timeout) {
        subtitles.innerHTML = getMaxWords(speech);

        // Clear Text after moments of silence.
        if (timeout) {
            clearTimeout(updateSubtitles.ival);
            updateSubtitles.ival = setTimeout(async ival => {
                subtitles.innerHTML = ' ';
            }, (+clearTime) * 1000);
        }
        return subtitles.innerHTML;
    }

    function getMaxWords(text) {
        let words = text.split(' ');
        return words.slice(-maxWords).join(' ');
    }
})();
