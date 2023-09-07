import React, {useContext, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HxDRPAssetThumbnail} from "./HxDRProjectFoldersContainer";
import {HxDRAssetContentsRenderer} from "./HxDRAssetContentsRenderer";
import {WorkspaceBuilderAction} from "../../../interfaces/WorkspaceBuilderAction";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";
import {ApplicationContext} from "../../../contextprovider/ApplicationContext";
import {Button, Form, Modal} from "react-bootstrap";
import {HxDRProjectContext} from "../contextprovider/HxDRProjectContext";
import {electronBridge} from "../../../electronbridge/Bridge";

type ActionTypes = "delete-confirm" | "asset-info";

interface Props {
    asset: {
        id: string;
        name: string;
        thumbnailPath: string;
    };
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
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
    const [show, setShow] = useState(false);
    const [action, setAction] = useState("asset-info" as ActionTypes);
    const {project} = useContext(HxDRProjectContext);

    const {contextMenu} = useContext(ApplicationContext);

    const handleContextMenu = (event: any)=>{
        event.preventDefault();
        contextMenu?.show({
            x: event.clientX,
            y: event.clientY,
            event: event,
            contextMenu: {
                items: [
                    {
                        label: "Asset info",
                        title: "Shows asset Info",
                        action: showAssetInfo
                    },
                    {
                        separator: true
                    },
                    {
                        label: "Delete asset",
                        title: "Deletes the asset",
                        action: deleteAssetByAssetId
                    },
                ]
            }
        });
    }

    const handleShow = (anAction:  ActionTypes) => {
        setAction(anAction)
        setShow(true);
    }

    const showAssetInfo = () => {
        console.log("Show folder info: " + props.asset.id);
        handleShow("asset-info");
    }

    const deleteAssetByAssetId = () => {
        handleShow("delete-confirm");
    }


    const onClickAsset = () => {
        setExpanded(!expanded);
        const data: HxDRPAssetThumbnail = {
            thumbnailPath: props.asset.thumbnailPath,
            name: props.asset.name,
            id: props.asset.id
        }
        if (typeof props.onSetThumbnail === "function") props.onSetThumbnail(data);
    }
    const handleClose = () => {
        setShow(false);
    }

    const handleCommit = () => {
        handleClose();
        if (action==="delete-confirm") {
            electronBridge.ipcRenderer.send("hxdr-command", {
                type: "delete-asset-by-assetId",
                assetId: props.asset.id,
            })
        }
    }

  //  const active = props.currentLayer && props.currentLayer && props.currentLayer.id === props.asset.id ? " active" : "";
    const active = "";
    return (<>
        <li>
            <div onClick={onClickAsset} className={"asset" + active} onContextMenu={handleContextMenu}>
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
        </li>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                { action === "asset-info" ?
                    <Modal.Title>Asset Info</Modal.Title>
                    :
                    <Modal.Title>Confirm delete</Modal.Title>
                }

            </Modal.Header>
            <Modal.Body>
                { project && <Form>
                    <Form.Group className="mb-3" controlId="create-project-name-id">
                        <Form.Label>Project: "<span>{project.name}</span>"</Form.Label>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="create-folder-name-id">
                        <Form.Label>Asset name: "<span>{props.asset.name}</span>"</Form.Label>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="create-folder-name-id">
                        <Form.Label>Asset id: "<span>{props.asset.id}</span>"</Form.Label>
                    </Form.Group>
                </Form>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleCommit}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    </>)
}

export {
    HxDRAssetRenderer
}
