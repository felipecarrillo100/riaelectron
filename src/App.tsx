import React from 'react';
import './App.css';
import {LuciadMap} from "./components/luciad/LuciadMap";

function App() {
  const nodeVersion = (window as any).version.electron();
  return (
    <div className="App">
      <header className="App-header">
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
          The Node version is: {nodeVersion}
        </a>
      </header>
    </div>
  );
}

export default App;
