const bridge = window as any;
export const electronBridge = {
    version: bridge.version as {
        chrome: ()=>string;
        node: ()=>string;
        electron: ()=>string;
    },
    ipcRenderer: bridge.ipcRenderer as {
        send: (channel: string, data: any)=>void;
        on: (channel: string, func: (o:any)=>void) => void,
    }
}
