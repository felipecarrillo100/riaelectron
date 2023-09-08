import React, {useContext, useEffect, useRef, useState} from "react";
import "./LuciadMap.css"
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {ModelFactory} from "./factories/ModelFactory";
import {LayerFactory} from "./factories/LayerFactory";
import {
    PanoramaActions,
} from "./controls/panocontroller/actions/PanoramaActions";

import {ClosePanoramaButton} from "./ClosePanoramaButton";


import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {CreateNewLayer} from "./factories/CreateNewLayer";
import {
    attachPanoControllerToMap,
    attachPanoToMap,
    detachPanoFromMap
} from "./controls/panocontroller/actions/PanoAttach";
import {ApplicationContext} from "../../contextprovider/ApplicationContext";
import {UICommand} from "../../interfaces/UICommand";
import {UICommandActions} from "../../interfaces/UICommandActions";

interface Props {
    id?: string;
}
const LuciadMap: React.FC<Props> = (props: Props)=>{
    const {command} = useContext(ApplicationContext);

    useEffect(()=>{
        if (command) {
            processCommand(command);
        }
    }, [command]);

const processCommand = (command: UICommand) =>{
        //  Implement layer creation here!!
        if (command.action===UICommandActions.CreateAnyLayer) {
            CreateNewLayer(command.parameters).then((layer: any)=> {
                if (layer && map.current) {
                    map.current.layerTree.addChild(layer);
                    if (layer instanceof FeatureLayer) {
                        if (LayerFactory.isFusionPanoramaLayer(layer)) {
                            attachPanoControllerToMap(map.current);
                        }
                    }
                    if (command.parameters.autoZoom){
                        LayerFactory.getLayerBounds(layer).then(bounds=>{
                            map.current?.mapNavigator.fit({bounds, animate: true});
                        });
                    }
                }
            });
        }
    }

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

    return (<div className="LuciadMap" id={props.id} ref={element}>
        {panoModeEnabled && <div className="CenterButtons">
            <ClosePanoramaButton onClick={closePanorama}/>
        </div>}
    </div>)
}


export {
    LuciadMap
}
