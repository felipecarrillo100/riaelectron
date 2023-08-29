import React, {useContext, useState} from "react";
import "./projects/styles.scss"
import "./HxDRPanel.scss"
import HxDRProjectsLIst, {HxDRProjectItem} from "./projects/HxDRProjectsLIst";
import {HxDRProjectFoldersContainer} from "./projects/HxDRProjectFoldersContainer";
import {CreateHxDRLayerCommand, LayerInfoHxDR} from "./utils/CreateHxDRLayerCommand";
import {ApplicationContext} from "../../contextprovider/ApplicationContext";
import {HxDRProjectContext} from "./contextprovider/HxDRProjectContext";

export const HxDRPanel: React.FC = () => {
    const {sendCommand} = useContext(ApplicationContext);

    const [project, setProject] = useState(null as HxDRProjectItem | null);
    const [currentLayer, setCurrentLayer] = useState(null as LayerInfoHxDR | null);

    const onItemSelected = (layer: LayerInfoHxDR, index?: number) => {
        setCurrentLayer(layer);
    }
    const onItemSelectedDoubleClick = (layerInfoHxDR: LayerInfoHxDR, index?: number) => {
        if (typeof sendCommand === "function") {
            CreateHxDRLayerCommand(layerInfoHxDR).then(command=>{
                command.parameters.autoZoom = true;
                if (layerInfoHxDR.type==="HSPC" || layerInfoHxDR.type==="OGC_3D_TILES") {
                    // command.parameters.layer.offsetTerrain = this.offsetTerrain;
                }
                if (layerInfoHxDR.type==="OGC_3D_TILES") {
                    // command.parameters.layer.isDrapeTarget = this.isDrapeTarget;
                }
                sendCommand(command);
            }, ()=>{
                console.log(`Was not able to create command: ${layerInfoHxDR.name} ${layerInfoHxDR.type}`)
            })
        }
    }
    return (
        <HxDRProjectContext.Provider value={{project, setProject}}>
            <div className="HxDRProjectsTab">
                <HxDRProjectsLIst project={project as any} setProject={setProject}/>
                <HxDRProjectFoldersContainer
                    project={project as HxDRProjectItem}
                    onItemSelected={onItemSelected}
                    onItemSelectedDoubleClick={onItemSelectedDoubleClick}
                    onSetThumbnail={()=>{}}
                    currentLayer={currentLayer}
                />
            </div>
        </HxDRProjectContext.Provider>

    )
}
