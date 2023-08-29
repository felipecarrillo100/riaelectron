import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HxDRPAssetThumbnail} from "./HxDRProjectFoldersContainer";
import {HxDRFolderContentsRenderer} from "./HxDRFolderContentsRenderer";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";

interface Props {
    folderId: string;
    name: string;
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
}

const HxDRFolderRenderer: React.FC<Props> = (props: Props) => {
    const [expanded, setExpanded] = useState(false);


    const onClickFolder = () => {
      setExpanded(!expanded);
    }

    return (
        <li className="HxDRFolderRenderer">
            <div onClick={onClickFolder} className="folder">
                <span className="icon-wrapper">
                    { expanded && <FontAwesomeIcon className="FontAwesomeIcon-class" icon="folder-open" /> }
                    { !expanded && <FontAwesomeIcon className="FontAwesomeIcon-class" icon="folder" /> }
                </span>
                <span>{props.name}</span>
            </div>
            { expanded ?
                <HxDRFolderContentsRenderer name={props.name} folderId={props.folderId}
                                            onItemSelected={props.onItemSelected}
                                            onItemSelectedDoubleClick={props.onItemSelectedDoubleClick}
                                            onSetThumbnail={props.onSetThumbnail}
                                            currentLayer={props.currentLayer}
                /> :
                <></>
            }
        </li>
    )
}
export {
    HxDRFolderRenderer
}
