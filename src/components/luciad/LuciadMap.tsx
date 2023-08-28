import React, {useEffect, useRef, useState} from "react";
import "./LuciadMap.css"
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {ModelFactory} from "./factories/ModelFactory";
import {LayerFactory} from "./factories/LayerFactory";
import {
    PanoramaActions,
} from "./controls/panocontroller/actions/PanoramaActions";

import {ClosePanoramaButton} from "./ClosePanoramaButton";


import {createHxDRLayer} from "./hxdr/HxDRLayerUtils";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {CreateNewLayer} from "./factories/CreateNewLayer";
import {
    attachPanoControllerToMap,
    attachPanoToMap,
    detachPanoFromMap
} from "./controls/panocontroller/actions/PanoAttach";
import {HxDRProjectAssetLayer} from "../hxdr/projects/HxDRProjectFoldersContainer";
import {CreateLayerInfo} from "../../interfaces/CreateLayerInfo";

interface Props {
    id?: string;
}
const LuciadMap: React.FC<Props> = (props: Props)=>{

    const [panoModeEnabled, setPanoModeEnabled] = useState(false);
    const panoModeEnabledRef = useRef(false);
    const animationActiveRef = useRef(false);
    const currentPanoCameraPointRef  = useRef([] as number[]);

    const element = useRef( null as null | HTMLDivElement);
    const map = useRef( null as null | WebGLMap);

    const setListeners = ()=>{
        const closePanoramaViewOnInvalidMove = () => {
            if (animationActiveRef.current===false && panoModeEnabledRef.current && map.current) {
                const newPoint = [map.current.camera.eyePoint.x, map.current.camera.eyePoint.y, map.current.camera.eyePoint.z];
                if ( !(currentPanoCameraPointRef.current[0] === newPoint[0] &&
                    currentPanoCameraPointRef.current[1] === newPoint[1] &&
                    currentPanoCameraPointRef.current[2] === newPoint[2])) {
                    closePanorama();
                }
            }
        }
        const mapBoundsHaveChanged = () => {
            closePanoramaViewOnInvalidMove();
        }
        if(map.current) {
            map.current.on('MapChange', mapBoundsHaveChanged);
        }
    }
    async function initializeMap() {
        const bModel = await ModelFactory.createBingmapsModel({
                 imagerySet: "Aerial",
                 useproxy: false,
                 token: "AugjqbGwtwHP0n0fUtpZqptdgkixBt5NXpfSzxb7q-6ATmbk-Vs4QnqiW6fhaV-i"
             });
        const bLayer = await LayerFactory.createBingmapsLayer(bModel, {label: "Aerial"});
        map.current?.layerTree.addChild(bLayer);

        const model3D = await ModelFactory.createOgc3DTilesModel({
            "url": "https://sampledata.luciad.com/data/ogc3dtiles/LucerneAirborneMesh/tileset.json",
            "credentials": false,
            "requestHeaders": {},
            "requestParameters": {},
        });
        const layer3D  = await LayerFactory.createOgc3DTilesLayer(model3D, {label: "Point cloud"});
        map.current?.layerTree.addChild(layer3D);

        const panoModelOptions = {
            "url": "https://sampledata.luciad.com/data/panoramics/LucernePegasus/cubemap_final.json",
            "crs": "urn:ogc:def:crs:EPSG::4326",
            "credentials": false,
            "requestHeaders": {},
        }
        const panoModel = await ModelFactory.createPanoramicsModel(panoModelOptions);

        const panoLayer = await LayerFactory.createPanoramicsLayer(panoModel, {
            "iconHeightOffset": 2.5,
            "editable": false,
            "selectable": false,
            "label": "/data/panoramics/LucernePegasus",
            "id": "1ad0d3ca-f77c-4f25-9e31-ee1917aa110d",
            "parent_id": "83fd6da4-04fb-404f-82ed-ac96af409fc4",
            "visible": true,
            "treeNodeType": "LAYER_FEATURE"
        }, panoModelOptions);
        map.current?.layerTree.addChild(panoLayer);
        const queryFinishedHandle = panoLayer.workingSet.on("QueryFinished", () => {
            if (panoLayer.bounds) {
                //#snippet layerFit
                map.current?.mapNavigator.fit({
                    bounds: panoLayer.bounds,
                    animate: true
                });
                //#endsnippet layerFit
            }
            queryFinishedHandle.remove();
        });
        if (map.current) attachPanoControllerToMap(map.current);
    }

    useEffect(()=>{
        if (element.current) {
            map.current = new WebGLMap(element.current, {reference: getReference("epsg:4978")});
            if (map.current) attachPanoToMap(map.current, (value)=>{
                panoModeEnabledRef.current = value
                setPanoModeEnabled(value);
            }, (value)=>{
                animationActiveRef.current = value;
                if (value===false && map.current) {
                    currentPanoCameraPointRef.current =[map.current.camera.eyePoint.x, map.current.camera.eyePoint.y, map.current.camera.eyePoint.z];
                }
            });
            setListeners();
            initializeMap();
        }
        return ()=> {
            if (map.current) {
                detachPanoFromMap(map.current);
                map.current.destroy();
                map.current = null;
            }
        }
    },
        // eslint-disable-next-line
        []);

    const closePanorama = () => {
        if (map.current && (map.current as any)._myPanoramaActions) {
            const panoActions = (map.current as any)._myPanoramaActions as PanoramaActions;
            if (panoActions.isInPanoramaMode()) {
                panoActions.leavePanoramaMode()
            }
        }
    }

    const onHxDRLayerRequested = (layerInfo: HxDRProjectAssetLayer, index?: number) => {
        createHxDRLayer(layerInfo).then((layer: any)=>{
            if (layer && map.current) {
                map.current.layerTree.addChild(layer);
                if (layer instanceof  FeatureLayer) {
                    if (LayerFactory.isFusionPanoramaLayer(layer)) {
                        attachPanoControllerToMap(map.current);
                    }
                }
                LayerFactory.getLayerBounds(layer).then(bounds=>{
                    map.current?.mapNavigator.fit({bounds, animate: true});
                });
            }
        });
    }

    const onNewLayerRequested = (layerInfo: CreateLayerInfo, index?: number) => {
        CreateNewLayer(layerInfo).then((layer: any)=> {
            if (layer && map.current) {
                map.current.layerTree.addChild(layer);
                if (layer instanceof  FeatureLayer) {
                    if (LayerFactory.isFusionPanoramaLayer(layer)) {
                        attachPanoControllerToMap(map.current);
                    }
                }
                LayerFactory.getLayerBounds(layer).then(bounds=>{
                    map.current?.mapNavigator.fit({bounds, animate: true});
                });
            }
        });
    }

    return (<div className="LuciadMap" id={props.id} ref={element}>
        {panoModeEnabled && <div className="CenterButtons">
            <ClosePanoramaButton onClick={closePanorama}/>
        </div>}
    </div>)
}


export {
    LuciadMap
}
