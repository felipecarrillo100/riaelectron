const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('version', {
    node: ()=> {
        return process.versions.node
    },
    chrome: ()=> process.versions.chrome,
    electron: ()=> process.versions.electron,
})

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data)=> ipcRenderer.send(channel, data),
    on: (channel, func)=> ipcRenderer.on(channel, (event, ...args)=>func(...args)),
})
