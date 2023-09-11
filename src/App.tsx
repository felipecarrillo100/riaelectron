import React, {useEffect, useRef, useState} from 'react';
import './App.scss';
import {LuciadMap} from "./components/luciad/LuciadMap";
import {electronBridge} from "./electronbridge/Bridge";
import {HxDRPanel} from "./components/hxdr/HxDRPanel";
import {ApolloProvider} from "@apollo/client";
import {createNewApolloClient} from "./components/hxdr/client/HxDRClient";
import {AuthState, ApplicationContext} from "./contextprovider/ApplicationContext";
import {setHxDRAccessToken} from "./components/hxdr/tokens/HxDRTokens";
import {UICommand} from "./interfaces/UICommand";
import CustomContextMenu from "react-class-contexify";
import {Tab, Tabs} from "react-bootstrap";
import {TaskList} from "./components/tasks/TaskList";

const client = createNewApolloClient();

function App() {
    const contextMenuRef = useRef(null);

    const [key, setKey] = useState('home');
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
      <ApplicationContext.Provider value={{authenticated, setAuthenticated, command, sendCommand, contextMenu}}>
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
                    <Tabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k as string)}
                        className="mb-3"
                    >
                        <Tab eventKey="home" title="Home">
                            <div className="MapHolder">
                                <LuciadMap />
                            </div>
                        </Tab>
                        <Tab eventKey="profile" title="Uploads">
                            <TaskList />
                        </Tab>
                        <Tab eventKey="contact" title="Jobs">
                            Processing jobs will be added here
                        </Tab>
                    </Tabs>

                </div>
              </div>
            </div>
          </ApolloProvider>
      </ApplicationContext.Provider>
  );
}

export default App;
