(e => {
    'use strict';

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Settings
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    const settings = getSettings();
    const azureCognitionSubscriptionKey = settings.azureKey || '';
    const azureRegion = settings.azureRegion || '';
    const backgroundColor = settings.backgroundColor || 'transparent';
    const clearTime = settings.clearTimeSeconds || 4;
    const maxWords = settings.maxWords || 250;
    const autopunctuation = settings.autoPunctuation;
    const profanityFilter = settings.profanityFilter;
    const autoShutoffTime = settings.autoShutoffTimeMinutes || 30;
    let urlStyle = uripart('style') || undefined;
    let subtitleStyle = urlStyle || settings.customStlye;

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LOGIC
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    var SpeechSDK;
    var recognizer;
    var idleTimeout;
    var connectTimeout;
    var subtitles = document.querySelector('#subtitle');

    document.body.style.backgroundColor = backgroundColor;
    document.addEventListener("DOMContentLoaded", function () {
        if (!!window.SpeechSDK)
            SpeechSDK = window.SpeechSDK;

        var speechConfig;
        try {
            speechConfig = SpeechSDK.SpeechConfig.fromSubscription(azureCognitionSubscriptionKey, azureRegion);
        }
        catch (err) {
            subtitles.innerHTML = 'Connection refused. Please check subscription key + region and reconnect.';
        }

        speechConfig.enableDictation();
        speechConfig.speechRecognitionLanguage = "en-US";
        if (autopunctuation !== true)
            speechConfig.setServiceProperty('punctuation', 'explicit', SpeechSDK.ServicePropertyChannel.UriQueryParameter);
        speechConfig.setProfanity(profanityFilter === true ? SpeechSDK.ProfanityOption.Masked : SpeechSDK.ProfanityOption.Raw);
        var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // Set Styles of Subtiltle Text
        updateSubtitleStyle(subtitleStyle);

        recognizer.recognizing = (s, e) => {
            //console.log(`RECOGNIZING: Text=${e.result.text}`);
            updateSubtitles(e.result.text, true);
            if (idleTimeout) {
                clearTimeout(idleTimeout);
                idleTimeout = null;
            }
            idleTimeout = setTimeout(function () {
                recognizer.stopContinuousRecognitionAsync();
                //connectBtn.disabled = false;
                //disconnectBtn.disabled = true;
            }, autoShutoffTime * 60 * 1000);
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
        };

        recognizer.sessionStopped = (s, e) => {
            recognizer.stopContinuousRecognitionAsync();
            updateSubtitles('Connection closed or timed out - Please reconnect.', true);
        };

        recognizer.sessionStarted = (s, e) => {
            if (connectTimeout) {
                clearTimeout(connectTimeout);
                connectTimeout = null;
            }
            updateSubtitles('Connected - Start Talking', true);
        };

        window.addEventListener('obsSourceActiveChanged', function (event) {
            if (event.detail.active === true) {
                location.reload();
            }
            else {
                recognizer.stopContinuousRecognitionAsync();
            }
        });

        connectTimeout = setTimeout(function () {
            subtitles.innerHTML = 'Unable to connect - network issue or unable to gain microphone access.';
        }, 15000);

        recognizer.startContinuousRecognitionAsync();
    });

    function updateSubtitleStyle(style) {
        subtitles.style.backgroundColor = settings.backgroundColor;
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

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Get URI Parameters
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function uripart(key) {
        const params = {};
        const href = location.href;

        if (href.indexOf('?') < 0) return '';

        href.split('?')[1].split('&').forEach(m => {
            const kv = m.split('=');
            params[kv[0]] = kv[1];
        });

        if (key in params) return decodeURIComponent(params[key]);

        return '';
    }

})();
