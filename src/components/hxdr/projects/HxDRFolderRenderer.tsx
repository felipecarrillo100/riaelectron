import React, {useContext, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HxDRPAssetThumbnail} from "./HxDRProjectFoldersContainer";
import {HxDRFolderContentsRenderer} from "./HxDRFolderContentsRenderer";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";
import {ApplicationContext} from "../../../contextprovider/ApplicationContext";
import {electronBridge} from "../../../electronbridge/Bridge";
import {Button, Form, Modal} from "react-bootstrap";
import {HxDRProjectContext} from "../contextprovider/HxDRProjectContext";


const availableTypes = [
    {value: "OBJ_UPLOAD", name: "Wavefront OBJ"},
    {value: "E57_UPLOAD", name: "E57"},
    {value: "LAS_UPLOAD", name: "LAS/LAZ"}
]
interface Props {
    folderId: string;
    name: string;
    disableDelete?: boolean;
    parentFolder?: {name: string; id: string};
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
}

type ActionTypes = "create-folder" | "create-asset" | "folder-info" | "delete-folder";

const HxDRFolderRenderer: React.FC<Props> = (props: Props) => {
    const {project, refreshCommand} = useContext(HxDRProjectContext);

    useEffect(()=>{
        if (refreshCommand) {
            if (refreshCommand.type==="REFRESH") {
                if (refreshCommand.target === props.folderId) {
                    if (expanded) {
                        setExpanded(false);
                        setTimeout(()=>{
                            setExpanded(true);
                        },1)
                    }
                }
            }
        }
    }, [refreshCommand])

    const [show, setShow] = useState(false);
    const [action, setAction] = useState("create-asset" as ActionTypes);

    const [inputs, setInputs] = useState({
        name: "",
        type: "OBJ_UPLOAD",
    })

    const handleClose = () => {
        setTimeout(()=>{
            setInputs({
                name: "",
                type: "OBJ_UPLOAD"
            })
        }, 200);
        setShow(false);
    }
    const handleShow = (anAction:  ActionTypes) => {
        setAction(anAction)
        setShow(true);
    }

    const handleCommit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (project) {
            if (action === "delete-folder" && !props.disableDelete) {
                electronBridge.ipcRenderer.send("hxdr-command", {
                    type: "delete-folder-by-folderId",
                    folderId: props.folderId.trim(),
                    projectId: project.id.trim(),
                    parentFolder: props.parentFolder
                })
            }
            if (action === "create-folder") {
                electronBridge.ipcRenderer.send("hxdr-command", {
                    type: "create-folder",
                    folderName: inputs.name,
                    folderId: props.folderId,
                    projectId: project.id,
                    parentFolder: {name: props.name, id: props.folderId}
                })
            }
            if (action==="create-asset") {
                electronBridge.ipcRenderer.send("hxdr-command", {
                    type: "create-asset",
                    folderName: inputs.name,
                    folderId: props.folderId,
                    assetType: inputs.type,
                    parentFolder: {name: props.name, id: props.folderId}
                })
            }
        }
        handleClose();
    }

    const [expanded, setExpanded] = useState(false);
    const {contextMenu} = useContext(ApplicationContext);


    const onClickFolder = () => {
      setExpanded(!expanded);
    }

    const createFolder = () => {
        console.log("Create folder at: " + props.folderId);
        handleShow("create-folder");
    }

    const createAsset = () => {
        console.log("Create asset at: " + props.folderId);
        handleShow("create-asset");
    }

    const deleteFolder = () => {
        console.log("Delete folder at: " + props.folderId);
        if (!props.disableDelete) handleShow("delete-folder");
    }

    const showFolderInfo = () => {
        console.log("Show folder info: " + props.folderId);
        handleShow("folder-info");
    }

    const handleContextMenu = (event: any)=>{
        event.preventDefault();
        contextMenu?.show({
            x: event.clientX,
            y: event.clientY,
            event: event,
            contextMenu: {
                items: [
                    {
                        label: "Create folder",
                        title: "Creates a new folder",
                        action: createFolder
                    },
                    {
                        label: "Create asset",
                        title: "Creates a new asset",
                        action: createAsset
                    },
                    {
                        separator: true
                    },
                    {
                        label: "Delete folder",
                        title: "Delete selected folder",
                        action: deleteFolder
                    },
                    {
                        separator: true
                    },
                    {
                        label: "Folder Info",
                        title: "Display information about the folder",
                        action: showFolderInfo
                    },
                ]
            }
        });
    }

    const handleChange = (event: any) => {
        const name  = event.target.name;
        const value  = event.target.value;
        if (value) {
            const newInputs = {...inputs};
                 // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        }
    };

    const info =
        `Project ID: ${project ? project.id :""}
Folder ID: ${props.folderId}`

    const returnHeader = (action:ActionTypes) => {
        switch (action) {
            case "delete-folder":
                return <Modal.Title>Confirm Delete Folder</Modal.Title>;
            case "create-asset":
                return <Modal.Title>Create Asset</Modal.Title>;
            case "create-folder":
                return <Modal.Title>Create Folder</Modal.Title>
            case "folder-info":
                return <Modal.Title>Folder Info</Modal.Title>
        }
    }

    return (
        <>
            <li className="HxDRFolderRenderer">
                <div onClick={onClickFolder} className="folder" onContextMenu={handleContextMenu}>
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

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    { returnHeader(action) }
                </Modal.Header>
                <Form onSubmit={handleCommit}>
                <Modal.Body>
                    { project && <>
                        <Form.Group className="mb-3" controlId="create-project-name-id">
                            <Form.Label>Project: "<span>{project.name}</span>"</Form.Label>
                        </Form.Group>
                        {(action === "delete-folder") ?
                            <>
                                <Form.Group className="mb-3" controlId="create-folder-name-id">
                                    <Form.Label>Folder: "<span>{props.name}</span>"</Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="create-folder-name-id">
                                    <Form.Label>Parent Folder: "<span>{props.parentFolder?.name}</span>"</Form.Label>
                                </Form.Group>
                            </>:
                            <Form.Group className="mb-3" controlId="create-folder-name-id">
                                <Form.Label>Parent folder: "<span>{props.name}</span>"</Form.Label>
                            </Form.Group>
                        }

                        {(action === "create-folder" || action==="create-asset") &&
                            <Form.Group className="mb-3" controlId="create-name-id">
                                <Form.Label>New {action==="create-folder" ? "folder" : "asset"} name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Name"
                                    autoFocus
                                    name="name"
                                    value={inputs.name}
                                    onChange={handleChange}
                                    required={true}
                                />
                            </Form.Group>
                        }
                        {action === "create-asset" &&
                            <Form.Group
                                className="mb-3"
                                controlId="create-type-id"
                            >
                                <Form.Label>Type</Form.Label>
                                <Form.Control as="select" name="type" value={inputs.type} onChange={handleChange} >
                                    {availableTypes.map(t=>(<option value={t.value} key={t.value}>{t.name}</option>))}
                                </Form.Control>
                            </Form.Group>
                        }
                        {(action === "folder-info" ) &&
                            <Form.Group
                                className="mb-3"
                                controlId="show-info-id"
                            >
                                <Form.Label>Info</Form.Label>
                                <Form.Control as="textarea" name="type" value={info} readOnly={true} />
                            </Form.Group>
                        }
                            </>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit" >
                        OK
                    </Button>
                </Modal.Footer>
                </Form>
            </Modal>
        </>

    )
}
export {
    HxDRFolderRenderer
}
