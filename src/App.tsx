import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {LuciadMap} from "./components/luciad/LuciadMap";
import {electronBridge} from "./electronbridge/Bridge";
import {HxDRPanel} from "./components/hxdr/HxDRPanel";
import {ApolloProvider} from "@apollo/client";
import {createNewApolloClient} from "./components/hxdr/client/HxDRClient";
import {AuthState, HxDRAuthContext} from "./components/hxdr/client/HxDRAuthContext";
import {setHxDRAccessToken} from "./components/hxdr/tokens/HxDRTokens";
import {UICommand} from "./interfaces/UICommand";
import CustomContextMenu from "react-class-contexify";

const client = createNewApolloClient();

function App() {
    const contextMenuRef = useRef(null);

    const [authenticated, setAuthenticated] = useState(AuthState.NotAuthenticated);
    const [command, sendCommand] = useState(null as UICommand | null)
    const [contextMenu, setContextMenu] = useState(null as CustomContextMenu | null)

    useEffect(() => {
        electronBridge.ipcRenderer?.on("hxdr-token", handleTokenChange);

        return () => {
          // unsubscribe event
        };
    }, []);

    useEffect(() => {
        setContextMenu(contextMenuRef.current)
        return () => {
            // unsubscribe event
        };
    }, [contextMenuRef.current]);


  const handleTokenChange = (options:any) => {
      if (options.refreshToken && options.accessToken) {
          setHxDRAccessToken(options.accessToken);
          setAuthenticated(AuthState.Authenticated);
      } else {
          setHxDRAccessToken(null);
          setAuthenticated(AuthState.NotAuthenticated);
      }
  }

  const message = () =>{
    electronBridge.ipcRenderer?.send("canal5", {hello:"there", n: 23})
  }

  return (
      <HxDRAuthContext.Provider value={{authenticated, setAuthenticated, command, sendCommand, contextMenu}}>
          <ApolloProvider client={client}>
            <div className="App" >
                <CustomContextMenu menuID="menuforfeatures" ref={contextMenuRef}/>
                <div className="row-main">
                <div className="column1">
                  <div className="PanelHolder">
                      {authenticated===AuthState.Authenticated ?
                          <HxDRPanel /> :
                          <div>
                              <h6>You need to login to HxDR first</h6>
                          </div>
                      }
                  </div>
                </div>
                <div className="column2" >
                  <div className="MapHolder">
                    <LuciadMap />
                  </div>
                </div>
              </div>
            </div>
          </ApolloProvider>
      </HxDRAuthContext.Provider>
  );
}

export default App;
