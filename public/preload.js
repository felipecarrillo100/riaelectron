const {contextBridge} = require("electron")

contextBridge.exposeInMainWorld('version', {
    node: ()=> {
        return process.versions.node
    },
    chrome: ()=> process.versions.chrome,
    electron: ()=> process.versions.electron,
})
