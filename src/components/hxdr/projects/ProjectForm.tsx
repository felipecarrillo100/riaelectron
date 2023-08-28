import React, {useState} from "react";
import HxDRProjectsLIst, {HxDRProjectItem} from "./HxDRProjectsLIst";
import {HxDRProjectAssetLayer, HxDRProjectFoldersContainer} from "./HxDRProjectFoldersContainer";

interface Props {
    onHxDRLayerRequested?: (layer: HxDRProjectAssetLayer, index?: number) => void;
}

const ProjectForm: React.FC<Props> = (props) => {
    const [project, setProject] = useState(null as HxDRProjectItem | null);
    const [currentLayer, setCurrentLayer] = useState(null as HxDRProjectAssetLayer | null);


    const onItemSelected = (layer: HxDRProjectAssetLayer, index?: number) => {
        setCurrentLayer(layer);
    }
    const onItemSelectedDoubleClick = (layer: HxDRProjectAssetLayer, index?: number) => {
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
