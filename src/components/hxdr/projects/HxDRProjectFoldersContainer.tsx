import React from "react";
import {HxDRProjectItem} from "./HxDRProjectsLIst";
import {HxDRFolderRenderer} from "./HxDRFolderRenderer";
import {FormGroup, FormLabel} from "react-bootstrap";
import "./HxDRProjectFoldersContainer.scss"
import ScrollableDiv from "../../../components/scrollablediv/ScrollableDiv";

export interface HxDRProjectAssetLayer {
    name: string;
    id: string;
    thumbnailPath: string;
    type: "HSPC" |"OGC_3D_TILES" | "PANORAMIC";
    endpoint: string;
}

export interface HxDRPAssetThumbnail {
    name: string;
    id: string;
    thumbnailPath: string;
}

interface Props {
    project: HxDRProjectItem;
    onItemSelected(properties: HxDRProjectAssetLayer, index?: number): void;
    onItemSelectedDoubleClick?(properties: HxDRProjectAssetLayer, index?: number): void;
    onSetThumbnail(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: HxDRProjectAssetLayer | null;
}

const HxDRProjectFoldersContainer: React.FC<Props> = (props: Props) => {
    return (<div className="HxDRProjectFoldersContainer">
        {props.project ? <FormGroup controlId="demo-multiple-checkbox">
            <FormLabel id="demo-multiple-checkbox-label">
                Select asset:
            </FormLabel>

            <ScrollableDiv style={{color:"white"}} scrollheight={280} className="main-container">
                <ul>
                    <HxDRFolderRenderer folderId={props.project.rootFolder.id} name="root"
                                        onItemSelected={props.onItemSelected}
                                        onItemSelectedDoubleClick={props.onItemSelectedDoubleClick}
                                        onSetThumbnail={props.onSetThumbnail}
                                        currentLayer={props.currentLayer}
                    />
                </ul>
            </ScrollableDiv>
        </FormGroup> : <></>
        }
    </div>)
}
export {
    HxDRProjectFoldersContainer
}
