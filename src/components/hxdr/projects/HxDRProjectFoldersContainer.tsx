import React from "react";
import {HxDRProjectItem} from "./HxDRProjectsLIst";
import {HxDRFolderRenderer} from "./HxDRFolderRenderer";
import {FormGroup, FormLabel} from "react-bootstrap";
import "./HxDRProjectFoldersContainer.scss"
import ScrollableDiv from "../../../components/scrollablediv/ScrollableDiv";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";


export interface HxDRPAssetThumbnail {
    name: string;
    id: string;
    thumbnailPath: string;
}

interface Props {
    project: HxDRProjectItem;
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
}

const HxDRProjectFoldersContainer: React.FC<Props> = (props: Props) => {
    return (<div className="HxDRProjectFoldersContainer">
        {props.project ? <FormGroup controlId="demo-multiple-checkbox">
            <FormLabel id="demo-multiple-checkbox-label">
                Select asset:
            </FormLabel>

            <ScrollableDiv scrollheight={280} className="main-container">
                <ul>
                    <HxDRFolderRenderer folderId={props.project.rootFolder.id} name="root"
                                        disableDelete={true}
                                        parentFolder={undefined}
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
