// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path')

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}
let mainWindow = null;
function createWindow() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html') file://${__dirname}/client/index.html
  //mainWindow.loadURL(`http://localhost:3000`);
  mainWindow.loadURL(`file://${__dirname}/web/index.html`)
  mainWindow.webContents.openDevTools();

  let currentDir = app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();

  console.log(currentDir)

  ipcMain.on("writeFile", function (event, arg) {
    //console.log("writeFile",arg);
    const r = arg

    let writeBase = path.resolve(__dirname, "../");
    //console.log(fs);
    let dir = currentDir + "/" + r.key;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    let file = dir + `/${getNowFormatDate()}.html`;//path.resolve(__dirname, `../${r.key}/${getNowFormatDate()}.html`);
    console.log(file)
    //console.log(mainWindow.webContents)
    //fs.writeFile(path.join(__dirname,`./${r.key}/index.html`),r.data,"utf8",()=>{})
    fs.writeFile(file, r.data, { encoding: 'utf8' }, (err, data) => {
      //console.log(err);
      if (err) {
        mainWindow.webContents.send("writeComplete", {
          status: "error",
          msg: err,
          filepath: file,
          root: writeBase
        })
      } else {
        mainWindow.webContents.send("writeComplete", {
          status: "success",
          msg: data,
          filepath: file,
          root: writeBase
        })
      }
    })
  })

  //console.log(ipcMain);



  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
