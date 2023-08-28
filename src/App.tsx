import React, {useEffect, useState} from 'react';
import './App.css';
import {LuciadMap} from "./components/luciad/LuciadMap";
import {electronBridge} from "./electronbridge/Bridge";
import {HxDRPanel} from "./components/hxdr/HxDRPanel";


function App() {
  useEffect(() => {
    electronBridge.ipcRenderer?.on("canal5", handleOptions)
    return () => {
      // unsubscribe event
    };
  }, []);

  const [color, setColor] = useState("black");

  const handleOptions = (options: any) => {
    console.log(options)
    setColor(options.color);
  }

  const message = () =>{
    electronBridge.ipcRenderer?.send("canal5", {hello:"there", n: 23})
  }

  return (
    <div className="App" >
      <div className="row-main">
        <div className="column1">
          <div className="PanelHolder">
            <HxDRPanel />
          </div>
        </div>
        <div className="column2" >
          <div className="MapHolder">
            <LuciadMap />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
