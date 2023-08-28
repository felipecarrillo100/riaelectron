import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HxDRPAssetThumbnail, HxDRProjectAssetLayer} from "./HxDRProjectFoldersContainer";
import {HxDRAssetContentsRenderer} from "./HxDRAssetContentsRenderer";
import {WorkspaceBuilderAction} from "../../../interfaces/WorkspaceBuilderAction";


interface Props {
    asset: {
        id: string;
        name: string;
        thumbnailPath: string;
    };
    onItemSelected(properties: HxDRProjectAssetLayer, index?: number): void;
    onItemSelectedDoubleClick?(properties: HxDRProjectAssetLayer, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: HxDRProjectAssetLayer | null;
}

export function HxDRFindAssetEndPoint(assetContents: any, type: WorkspaceBuilderAction) {
    let  assetType = "";
    let  hxDRType = "";
    switch (type) {
        case WorkspaceBuilderAction.OGC3DTilesLayer:
            assetType = "MESH";
            hxDRType = "OGC_3D_TILES";
            break;
        case WorkspaceBuilderAction.HSPCLayer:
            assetType = "POINT_CLOUD";
            hxDRType = "HSPC";
            break;
    }
    const element = assetContents.find((e:any) =>  e.type===assetType);
    if (element) {
        const linkElement = element.addresses.contents.find((e:any) =>  e.type===hxDRType);
        if (linkElement) {
            return {
                endpoint: linkElement.endpoint,
                type: linkElement.type
            };
        }
    }
    return {
        endpoint: "",
        type: ""
    };
}

const HxDRAssetRenderer: React.FC<Props> = (props: Props) => {
    const [expanded, setExpanded] = useState(false);

    const onClickAsset = () => {
        setExpanded(!expanded);
        const data: HxDRPAssetThumbnail = {
            thumbnailPath: props.asset.thumbnailPath,
            name: props.asset.name,
            id: props.asset.id
        }
        if (typeof props.onSetThumbnail === "function") props.onSetThumbnail(data);
    }

  //  const active = props.currentLayer && props.currentLayer && props.currentLayer.id === props.asset.id ? " active" : "";
    const active = "";
    return (<li>
        <div onClick={onClickAsset} className={"asset" + active}>
            <span className="icon-wrapper">
                {expanded && <FontAwesomeIcon className="FontAwesomeIcon-class" icon="file" />}
                {!expanded && <FontAwesomeIcon className="FontAwesomeIcon-class" icon="file-alt" />}
            </span>
            <span>{props.asset.name}</span>
        </div>
        {
            expanded ?
                <HxDRAssetContentsRenderer asset={props.asset}
                                           onItemSelected={props.onItemSelected}
                                           onItemSelectedDoubleClick={props.onItemSelectedDoubleClick}
                                           currentLayer={props.currentLayer}
                /> :
                <></>
        }
    </li>)
}

export {
    HxDRAssetRenderer
}
