import React, {useContext, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HxDRPAssetThumbnail} from "./HxDRProjectFoldersContainer";
import {HxDRFolderContentsRenderer} from "./HxDRFolderContentsRenderer";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";
import {ApplicationContext} from "../../../contextprovider/ApplicationContext";
import {electronBridge} from "../../../electronbridge/Bridge";
import {Button, Form, Modal} from "react-bootstrap";
import {HxDRProjectContext} from "../contextprovider/HxDRProjectContext";


const availableTypes = [
    {value: "obj", name: "Wavefront OBJ"}
]
interface Props {
    folderId: string;
    name: string;
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
}

type ActionTypes = "create-folder" | "create-asset" | "folder-info";

const HxDRFolderRenderer: React.FC<Props> = (props: Props) => {
    const {project} = useContext(HxDRProjectContext);

    const [show, setShow] = useState(false);
    const [action, setAction] = useState("create-asset" as ActionTypes);

    const [inputs, setInputs] = useState({
        name: "",
        type: "obj",
    })

    const handleClose = () => {
        setTimeout(()=>{
            setInputs({
                name: "",
                type: "obj"
            })
        }, 200);
        setShow(false);
    }
    const handleShow = (anAction:  ActionTypes) => {
        setAction(anAction)
        setShow(true);
    }

    const handleCommit = () => {

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
        electronBridge.ipcRenderer.send("hxdr-command", {
            type: "create-folder",
            folderName: props.name,
            folderId: props.folderId,
        })
    }

    const createAsset = () => {
        console.log("Create asset at: " + props.folderId);
        handleShow("create-asset");
        electronBridge.ipcRenderer.send("hxdr-command", {
            type: "create-asset",
            folderName: props.name,
            folderId: props.folderId,
        })
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
                        separator: true
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
                    { action === "create-folder" ?
                        <Modal.Title>Create Folder</Modal.Title>
                        :
                        action === "create-asset" ?
                        <Modal.Title>Create Asset</Modal.Title> :
                        <Modal.Title>Folder Info</Modal.Title>
                    }

                </Modal.Header>
                <Modal.Body>
                    { project && <Form>
                        <Form.Group className="mb-3" controlId="create-project-name-id">
                            <Form.Label>Project: "<span>{project.name}</span>"</Form.Label>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="create-folder-name-id">
                            <Form.Label>Parent folder: "<span>{props.name}</span>"</Form.Label>
                        </Form.Group>
                        {action !== "folder-info" &&
                            <Form.Group className="mb-3" controlId="create-name-id">
                                <Form.Label>New {action==="create-folder" ? "folder" : "asset"} name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Name"
                                    autoFocus
                                    name="name"
                                    value={inputs.name}
                                    onChange={handleChange}
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
                        {action === "folder-info" &&
                            <Form.Group
                                className="mb-3"
                                controlId="show-info-id"
                            >
                                <Form.Label>Info</Form.Label>
                                <Form.Control as="textarea" name="type" value={info} readOnly={true} />
                            </Form.Group>
                        }
                            </Form>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCommit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    )
}
export {
    HxDRFolderRenderer
}
