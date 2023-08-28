import React, {useEffect, useState} from 'react';
import './App.css';
import {LuciadMap} from "./components/luciad/LuciadMap";
import {electronBridge} from "./electronbridge/Bridge";
import {HxDRPanel} from "./components/hxdr/HxDRPanel";
import {ApolloProvider} from "@apollo/client";
import {createNewApolloClient} from "./components/hxdr/client/HxDRClient";
import {AuthState, HxDRAuthContext} from "./components/hxdr/client/HxDRAuthContext";
import {setHxDRAccessToken} from "./components/hxdr/tokens/HxDRTokens";

const client = createNewApolloClient();

function App() {
    const [authenticated, setAuthenticated] = useState(AuthState.NotAuthenticated);

    useEffect(() => {
        electronBridge.ipcRenderer?.on("hxdr-token", handleTokenChange);

        return () => {
          // unsubscribe event
        };
    }, []);


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
      <HxDRAuthContext.Provider value={{authenticated, setAuthenticated}}>
          <ApolloProvider client={client}>
            <div className="App" >
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
