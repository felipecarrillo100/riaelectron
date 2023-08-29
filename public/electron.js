const path = require('path');

const { app, BrowserWindow, ipcMain, Menu, screen, dialog} = require('electron');

const staticC = require("node-static");
const http = require("http");

let mainWindow = null;
let myLoginWindow = null;
function isDevelopment() {
    return process.argv[2] == '--dev';
}

const isDev = isDevelopment();

const menu = [
    {
        label: "File",
        submenu: [
            {
                id: "disk-id",
                label: "Select asset Files",
                click: ()=> selectFolder(),
                accelerator: "CmdOrCtrl+F",
                enabled: true
            },
            {
                label: "Quit",
                click: ()=> app.quit(),
                accelerator: "CmdOrCtrl+Q"
            }
        ]
    },
    {
        label: "HxDR",
        submenu: [
            {
                id: "login-id",
                label: "Login",
                click: ()=> loginWindow(),
                accelerator: "CmdOrCtrl+L",
                enabled: true
            },
            {
                id: "logout-id",
                label: "Logout",
                click: ()=> logout(),
                accelerator: "CmdOrCtrl+O",
                enabled: false
            },
        ]
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Red",
                click: ()=>notify("red"),
                accelerator: "CmdOrCtrl+R"
            },
            {
                label: "Blue",
                click: ()=>notify("blue"),
                accelerator: "CmdOrCtrl+B"
            },
            {
                label: "About",
                click: about,
                accelerator: "CmdOrCtrl+A"
            }
        ]
    }
]


function createWindow() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const win = new BrowserWindow({
        width,
        height,
        minWidth:1024,
        minHeight:640,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "./preload.js")
        },
    });
    mainWindow = win;

    // and load the index.html of the app.
    // win.loadFile("index.html");
    // win.webContents.openDevTools()

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );
    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("canal5", (e, options)=>{
    console.log(JSON.stringify(options));
})

ipcMain.on("hxdr", (e, options)=>{
    switch (options.type) {
        case "closeWindow":
            console.log(`refreshToken: ${options.refreshToken}`);
            console.log(`accessToken: ${options.accessToken}`);
            const win = BrowserWindow.getFocusedWindow();
            win.close();
            Menu.getApplicationMenu().getMenuItemById('login-id').enabled = false;
            Menu.getApplicationMenu().getMenuItemById('logout-id').enabled = true;

            mainWindow.webContents.send("hxdr-token", {
                refreshToken: options.refreshToken,
                accessToken: options.accessToken
            });
            break;
    }
})

function about() {
    if (!mainWindow) return;
    const aboutWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        title: "About",
        width:  480,
        height: 580,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "./preload.js")
        },
    });

    aboutWindow.setMenu(null);

    aboutWindow.loadURL(
        isDev
            ? 'http://localhost:3000/#about'
            : `file://${path.join(__dirname, '../build/index.html#about')}`
    );
}

function selectFolder() {
    const path = dialog.showOpenDialog({
        properties: [
            'openFile',
            'multiSelections',
        ],
        filters: [
            { name: 'Wavefront Obj', extensions: ['jpg', 'png', 'mtl', 'obj', 'prj'] },
            { name: 'E57', extensions: ['e57', 'prj'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    path.then((result)=>{
        if (result.canceled===false) {
            console.log(JSON.stringify(result, null,2));
        } else {
            console.log("Cancelled")
        }
    })

}
function loginWindow() {
    if (!mainWindow) return;
    myLoginWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        title: "Logout",
        width:  480,
        height: 580,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "./preloadHxDR.js")
        },
    });

  //  myLoginWindow.webContents.session.clearCache().then(()=>{});
  //  myLoginWindow.webContents.openDevTools({ mode: 'detach' });

    myLoginWindow.setMenu(null);


    myLoginWindow.loadURL(
        isDev
            ? 'http://localhost:3600'
            : `https://demo.luciad.com/hxdr-remote-auth/`
    );
}

function logout() {
    Menu.getApplicationMenu().getMenuItemById('login-id').enabled = true;
    Menu.getApplicationMenu().getMenuItemById('logout-id').enabled = false;
    mainWindow.webContents.send("hxdr-token", {
        refreshToken: null,
        accessToken: null
    });
}

function notify(color) {
    if (!mainWindow) return;
    mainWindow.webContents.send("canal5", {
        color: color
    })
}

if (isDev) {
    const staticC = require('node-static');
    const file = new staticC.Server(`${__dirname}/../static`)
    const http = require('http')

    http.createServer(function (request, response) {
        request.addListener('end', function () {
            file.serve(request, response)
        }).resume()
    }).listen(3600);
}

