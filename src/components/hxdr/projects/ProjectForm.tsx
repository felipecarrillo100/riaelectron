import React, {useState} from "react";
import HxDRProjectsLIst, {HxDRProjectItem} from "./HxDRProjectsLIst";
import {HxDRProjectFoldersContainer} from "./HxDRProjectFoldersContainer";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";

interface Props {
    onHxDRLayerRequested?: (layer: LayerInfoHxDR, index?: number) => void;
}

const ProjectForm: React.FC<Props> = (props) => {
    const [project, setProject] = useState(null as HxDRProjectItem | null);
    const [currentLayer, setCurrentLayer] = useState(null as LayerInfoHxDR | null);


    const onItemSelected = (layer: LayerInfoHxDR, index?: number) => {
        setCurrentLayer(layer);
    }
    const onItemSelectedDoubleClick = (layer: LayerInfoHxDR, index?: number) => {
        if (typeof props.onHxDRLayerRequested === "function") {
            props.onHxDRLayerRequested(layer, index)
        }
    }
    return (<>
        <HxDRProjectsLIst project={project as any} setProject={setProject}/>
        <HxDRProjectFoldersContainer
            project={project as HxDRProjectItem}
            onItemSelected={onItemSelected}
            onItemSelectedDoubleClick={onItemSelectedDoubleClick}
            onSetThumbnail={()=>{}}
            currentLayer={currentLayer}
        />
    </>)
}

export {
    ProjectForm
};
