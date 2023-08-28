import {ModelFactory} from "../factories/ModelFactory";
import {LayerFactory} from "../factories/LayerFactory";
import {TileLoadingStrategy} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {getHxDRAccessToken} from "../../hxdr/tokens/HxDRTokens";
import {HxDRProjectAssetLayer} from "../../hxdr/projects/HxDRProjectFoldersContainer";
import {electronBridge} from "../../../electronbridge/Bridge";

export function createHxDRLayer(layerHxDR: HxDRProjectAssetLayer) {
    async function create3DTilesLayer(layerInfo: HxDRProjectAssetLayer) {
        const accessToken= getHxDRAccessToken() ? getHxDRAccessToken() : "";
        const baseUrl = electronBridge.hxdrServer.getUrl();
        const  modelOptions =  {
            "HxDRAuth": {
                "assetId": layerInfo.id
            },
            "url": `${baseUrl}${layerInfo.endpoint}`,
                "credentials": false,
                "requestHeaders": {
                "Authorization": `Bearer ${accessToken?accessToken:''}`
            }
        }
        const model = await ModelFactory.createOgc3DTilesModel(modelOptions);
        const layerOptions = {
            "selectable": true,
            "transparency": false,
            "idProperty": "FeatureID",
            "loadingStrategy": {
                "0": "DETAIL_FIRST",
                "1": "OVERVIEW_FIRST",
                "DETAIL_FIRST": 0,
                "OVERVIEW_FIRST": 1
            },
            "label": layerInfo.name,
            "offsetTerrain": true,
            "qualityFactor": 0.5
        }
        const layer = await LayerFactory.createOgc3DTilesLayer(model, layerOptions);
        return layer
    }

    async function createHSPCLayer(layerInfo: HxDRProjectAssetLayer) {
        const accessToken= getHxDRAccessToken() ? getHxDRAccessToken() : "";
        const baseUrl = electronBridge.hxdrServer.getUrl();
        const  modelOptions =  {
            "HxDRAuth": {
                "assetId": layerInfo.id
            },
            "url": `${baseUrl}${layerInfo.endpoint}`,
            "credentials": false,
            "requestHeaders": {
                "Authorization": `Bearer ${accessToken}`
            }
        }
        const model = await ModelFactory.createHSPCModel(modelOptions);
        const layerOptions = {
            "selectable": false,
            "transparency": false,
            "idProperty": "FeatureID",
            "label": layerInfo.name,
            "offsetTerrain": true,
            "qualityFactor": 0.3,
            loadingStrategy: TileLoadingStrategy.OVERVIEW_FIRST,
        }
        const layer = await LayerFactory.createHSPCLayer(model, layerOptions);
        return layer;
    }

    async function createPanoramicsLayer(layerInfo: HxDRProjectAssetLayer) {
        const accessToken= getHxDRAccessToken() ? getHxDRAccessToken() : "";
        const baseUrl = electronBridge.hxdrServer.getUrl();
        const panoModelOptions = {
            "url": `${baseUrl}${layerInfo.endpoint}`,
            "credentials": false,
            "requestHeaders": {
                "Authorization": `Bearer ${accessToken}`
            }
        }
        const panoModel = await ModelFactory.createPanoramicsModel(panoModelOptions);

        const panoLayer = await LayerFactory.createPanoramicsLayer(panoModel, {
            "iconHeightOffset": 1.5,
            "editable": false,
            "selectable": false,
            "label": layerInfo.name,
            "visible": true,
        }, panoModelOptions);
        return panoLayer;
    }

    return new Promise((resolve, reject)=> {
        switch (layerHxDR.type) {
            case "OGC_3D_TILES":
            {
                const layer =  create3DTilesLayer(layerHxDR);
                if (layer) resolve(layer); else reject();
            }
                break
            case "HSPC":
            {
                const layer =  createHSPCLayer(layerHxDR);
                if (layer) resolve(layer); else reject();
            }
                break;
            case "PANORAMIC": {
                const layer = createPanoramicsLayer(layerHxDR);
                if (layer) resolve(layer); else reject();
            }
                break;
        }
    });
}


