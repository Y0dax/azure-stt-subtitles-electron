# OBS STT Subtitles using Microsoft Azure Cognitive SDK

Welcome! This application presents Speech to Text subtitles in a standalone window that can be window captured by OBS or other prograsms. It is powered by Microsoft's Cognitive STT service. This is the same service that Microsoft Cortana uses.

> Note: The micrsoft cognitive service is not free and you will need to provide this program with a subscription key in order to use it. See more info here: https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/

# Setup

## Step 1 - Download latest release

Download the electron app from the releases tab

## Step 2 - Extract files

Extract the files from the zip into a location on your hard drive.

## Step 2 - Add Microsoft Cognition subscription key and region.

1. Open `resources/app/js/subtitles.js`.
2. Enter your subscription key and region into the provided fields and save the file.

```javascript
    const azureCognitionSubscriptionKey = ''; //Subscription key from Azure Cognitive Services
    const azureRegion = ''; //An azure region string (westeurope, eastus, etc)
```

3. Feel free to modify default settings below the key inputs.

## Step 3 - Run AzureSTTSubtitles.exe

 - The program should open a frameless window with a connect button at the bottom left.
 - The top portion where a title bar would be is draggable.
 - There is no close button currently. It can be closed by any of the following:
    - Right click the icon on your taskbar -> select close.
    - Alt + f4
    - Task Manager

## Step 4 - Add an OBS Window Capture

- Add a new window capture source in OBS.
- Select the window titled "Azure STT Subtitles"
- Uncheck Capture Cursor

## Step 5 - Add a Color Key Filter

- In order to make the subtitle window transparant, you can add a color key filer for whichever color you chose the app to be.
- Adjust the similarity and softness until the subtitles appear cleanly without background color

## Setup Complete!

Remember to close the application when not in use to save cost of being connected to the STT service. The application will automatically diconnect after 15 minutes (default) of silence.



<br><br>
# Additional Customizations

## Change Font Style

Documentation coming soon.
