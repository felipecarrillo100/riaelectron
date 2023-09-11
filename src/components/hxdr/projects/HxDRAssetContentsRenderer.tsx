import React, {useContext} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useQuery} from "@apollo/client";
import Glyphicon from "../../../components/glyphicon/Glyphicon";
import {HxDRGetAssetDetailsNew} from "../queries/graphql.queries";
import {ArtifactSimplified, LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";
import {HxDRProjectContext} from "../contextprovider/HxDRProjectContext";


const LayeerTypeTranslate = {
    "HSPC": "HSPC",
    "OGC_3D_TILES": "OGC_3D_TILES",
    "CUBEMAP_JSON": "PANORAMIC"
}

const ValidCategories = [
    "MESH",
    "POINT_CLOUD",
    "PANORAMIC"
];

let isValidLayerType = (address:any)=>(address.serviceType === "HSPC" || address.serviceType === "OGC_3D_TILES" || address.serviceType==="CUBEMAP_JSON");

interface Props {
    asset: {
        id: string;
        name: string;
        thumbnailPath: string;
    };
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    currentLayer: LayerInfoHxDR | null;
}

const HxDRAssetContentsRenderer: React.FC<Props> = (props: Props) => {
    const queryAsset = useQuery(HxDRGetAssetDetailsNew, {
        variables: {
            id: props.asset.id,
        },
        fetchPolicy: 'network-only'
    });
// asset.asset.artifacts.contents.
    const filteredData = queryAsset && queryAsset.data && queryAsset.data.asset ? queryAsset.data.asset.asset.artifacts.contents.filter((item:any)=>{
        if (!ValidCategories.includes(item.dataCategory)) return false;
        return item.addresses.contents.some(isValidLayerType) ;
    }): [];

    const rows = filteredData.map((item: any)=>{
        let hasDownloadLink = false;
        if (item.addresses.contents.find((i:any)=>i.consumptionType==="DOWNLOADABLE")){
            hasDownloadLink = true;
        }
        return {
            "type": item.dataCategory,
            "addresses": item.addresses.contents,
            hasDownloadLink
        }});

    const endpointType = (addresses: any) => {
        const endpoint = {
            type: null as string | null,
            endpoint: ""
        }
        for (const address of addresses) {
            if (isValidLayerType(address)) {
                // @ts-ignore
                endpoint.type = LayeerTypeTranslate[address.serviceType];
                endpoint.endpoint = address.endpoint;
                break;
            }
        }
        return endpoint;
    }

    const itemClicked = (row: ArtifactSimplified) => () => {
        if (typeof props.onItemSelected === "function") {
            const mode = endpointType(row.addresses);
            const layerInfo: LayerInfoHxDR = {
                id: props.asset?.id as string,
                name: props.asset?.name as string,
                type: mode.type as any,
                endpoint: mode.endpoint
            }
            props.onItemSelected(layerInfo);
        }
    }

    const itemDoubleClicked = (row: any) => () => {
        if (typeof props.onItemSelected === "function") {
            const mode = endpointType(row.addresses);
            const layerInfo: LayerInfoHxDR = {
                id: props.asset?.id as string,
                name: props.asset?.name as string,
                type: mode.type as any,
                endpoint: mode.endpoint
            }
            if (typeof props.onItemSelectedDoubleClick==="function") props.onItemSelectedDoubleClick(layerInfo);
        }
    }


    const validProcess = (row: any) => {
        const address = row.addresses.find((i:any)=>i.consumptionType!=="DOWNLOADABLE");
        return address.processingPipelineInfo.status !== "FAILED";
    }

    return (
        <>
            { !queryAsset.loading ?
                <ul>
                    {rows.map((row:any)=>{
                            let active = "";
                            if (props.currentLayer) {
                                const mode = endpointType(row.addresses);
                                if (
                                    props.currentLayer && props.currentLayer &&
                                    props.currentLayer.id === props.asset.id && props.currentLayer.type === mode.type
                                ) {
                                    active = " active" ;
                                }
                            }
                            return (
                            <li key={row.type} >
                                <div className={"asset" + active} onClick={itemClicked(row)} onDoubleClick={itemDoubleClicked(row)}>
                                    <span className="icon-wrapper" >
                                        <FontAwesomeIcon className="FontAwesomeIcon-class" icon="external-link-alt" />
                                    </span>
                                    {row.type}
                                    {!validProcess(row) && <span className="icon-wrapper" title="Process failed">
                                        <FontAwesomeIcon className="FontAwesomeIcon-class" icon="warning" />
                                    </span>}
                                </div>
                            </li>)
                    }
                    )}
                </ul> :
                <ul>
                    <li>
                        <span className="icon-wrapper"><Glyphicon glyph="spinner" className="fast-right-spinner"/></span>
                        <span>Loading...</span>
                    </li>
                </ul>
            }
        </>
    )
}

export {
    HxDRAssetContentsRenderer
}
