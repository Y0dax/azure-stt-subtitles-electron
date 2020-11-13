const {app, BrowserWindow} = require('electron')

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600, 
      transparent: true,
      frame: false
    })
  
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/subtitles.html`)
  
    // Open the DevTools.
    //mainWindow.webContents.openDevTools()
  
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  }

  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })