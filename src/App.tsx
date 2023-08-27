import React, {useEffect, useState} from 'react';
import './App.css';
import {LuciadMap} from "./components/luciad/LuciadMap";
import {electronBridge} from "./electronbridge/Bridge";


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
      <header className="App-header" style={{backgroundColor: color}}>
        <div className="MapHolder">
          <LuciadMap />
        </div>

        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          The Node version is abcd: {electronBridge.version?.node()}
        </a>
        <button onClick={message}>Send message to main</button>
      </header>
    </div>
  );
}

export default App;
