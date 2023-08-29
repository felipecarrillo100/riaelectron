
import {TileLoadingStrategy} from "@luciad/ria/view/tileset/TileSet3DLayer";
import GetCapabilities3DTiles from "./GetCapabilities3DTiles";
import GetCapabilitiesHSPC from "./GetCapabilitiesHSPC";
import GetCapabilitiesFusionPanorama from "./GetCapabilitiesFusionPanorama";
import {LTSCapabilities} from "@luciad/ria/model/capabilities/LTSCapabilities";
import {LTSCapabilitiesCoverage} from "@luciad/ria/model/capabilities/LTSCapabilitiesCoverage";
import {WMSCapabilities,} from "@luciad/ria/model/capabilities/WMSCapabilities";
import {WFSCapabilities} from "@luciad/ria/model/capabilities/WFSCapabilities";
import {UICommand} from "../../../interfaces/UICommand";
import {electronBridge} from "../../../electronbridge/Bridge";
import {getHxDRAccessToken} from "../tokens/HxDRTokens";
import {UILayerTypes} from "../../../interfaces/UILayerTypes";
import {UICommandActions} from "../../../interfaces/UICommandActions";
import {WFSCapabilitiesUtils} from "./WFSCapabilitiesUtils";
import {WMSCapabilitiesUtils} from "./WMSCapabilitiesUtils";
import {BoundsObject} from "../../../interfaces/BoundsObject";

export interface ArtifactSimplified {
  "type": "POINT_CLOUD" | "PANORAMIC" | "MESH",
  "addresses": any
}

export interface LayerInfoHxDR {
  id: string;
  name: string;
  type: "HSPC" | "PANORAMIC" | "OGC_3D_TILES" | "LTS" | "WFS" | "WMS";
  endpoint: string;
}

const autoZoom= true;
export function CreateHxDRLayerCommand(layerInfoHxDR:LayerInfoHxDR) {
  return new Promise<UICommand>((resolve, reject) => {
    switch (layerInfoHxDR.type) {
      case "PANORAMIC":
        CreateNewPanoramicCommand(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
      // case "MESH":
      case "OGC_3D_TILES":
        CreateNewOGC3DTiles(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
      case "HSPC":
      // case "POINT_CLOUD":
        CreateNewHSPC(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
      case "LTS":
        CreateNewLTS(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
      case "WMS":
        CreateNewWMS(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
      case "WFS":
        CreateNewWFS(layerInfoHxDR).then(command=>resolve(command), ()=>reject())
        break;
    }
  })
}

function CreateNewPanoramicCommand(layerInfo: LayerInfoHxDR) {
  return new Promise<UICommand>((resolve, reject) => {
    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const panoModelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }

    GetCapabilitiesFusionPanorama.fromURL(panoModelOptions.url, panoModelOptions).then(capabilities=>{
      if (capabilities.georeferenced){
        const panoLayerOptions = {
          "iconHeightOffset": 1.5,
          "editable": false,
          "selectable": false,
          "label": layerInfo.name,
          "visible": true,
        };

        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            layerType: UILayerTypes.PanoramicLayer,
            model: panoModelOptions,
            layer: panoLayerOptions,
            autoZoom
          },
        }
        resolve(command);
      } else {
        console.log("Panoramic Layer is not geroreferenced: " + layerInfo.name);
        reject();
      }
    })
  })
}

function CreateNewHSPC(layerInfo: LayerInfoHxDR) {
  return new Promise<UICommand>((resolve, reject) => {

    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const modelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    GetCapabilitiesHSPC.fromURL(modelOptions.url, modelOptions).then(capabilities=>{
      if (capabilities.georeferenced) {
        const layerOptions = {
          "selectable": false,
          "transparency": false,
          "idProperty": "FeatureID",
          "label": layerInfo.name,
          "offsetTerrain": true,
          "qualityFactor": 0.3,
          loadingStrategy: TileLoadingStrategy.OVERVIEW_FIRST,
        }
        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            layerType: UILayerTypes.HSPCLayer,
            model: modelOptions,
            layer: layerOptions,
            autoZoom
          },
        }
        resolve(command);
      } else {
        console.log("HSPC Layer is not geroreferenced: " + layerInfo.name);
        reject();
      }
    })
  });
}

function CreateNewLTS(layerInfo: LayerInfoHxDR) {
  function getLayerBounds (layer: LTSCapabilitiesCoverage){
    const e: BoundsObject = {
      coordinates:[], reference:""
    }
    const bounds = layer.getBounds();
    if (bounds && bounds.reference) {
      const r : BoundsObject = {
        coordinates: [bounds.x, bounds.width, bounds.y, bounds.height],
        reference: bounds.reference.identifier
      }
      return r;
    }
    return e;
  }
  return new Promise<UICommand>((resolve, reject) => {

    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const modelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    LTSCapabilities.fromURL(modelOptions.url, modelOptions).then(capabilities=>{
      if (capabilities.coverages.length===1) {
        const cleanUrl = modelOptions.url.split('?')[0];
        const queryString = modelOptions.url.split('?')[1];
        let signature = undefined;

        if (queryString) {
          const urlParams = new URLSearchParams(queryString);
          signature = urlParams.get("signature") ? urlParams.get("signature") : undefined;
        }

        const coverage = capabilities.coverages[0];
        const model = {
          ...modelOptions,
            url: cleanUrl,
            coverageId: coverage.id,
            referenceText: coverage.referenceName,
            boundsObject: getLayerBounds(coverage),
            level0Columns: coverage.level0Columns,
            level0Rows: coverage.level0Rows,
            tileWidth: coverage.tileWidth,
            tileHeight: coverage.tileHeight,
            dataType: coverage.type,
            samplingMode: coverage.samplingMode,
            requestParameters: {
              signature
            }
          };
        const layer = {
          label: coverage.name
        }
        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            layerType: UILayerTypes.LTSLayer,
            model,
            layer,
            autoZoom
          },
        }
        resolve(command);
      }
    })
  });
}

function CreateNewWMS(layerInfo: LayerInfoHxDR) {

  return new Promise<UICommand>((resolve, reject) => {

    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const modelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    WMSCapabilities.fromURL(modelOptions.url, modelOptions).then(capabilities=>{
      if (capabilities.layers.length===1 && capabilities.layers[0].children.length===1) {
        const roootLayer = capabilities.layers[0];
        const cleanUrl = modelOptions.url.split('?')[0];
        const queryString = modelOptions.url.split('?')[1];
        let signature = undefined;

        if (queryString) {
          const urlParams = new URLSearchParams(queryString);
          signature = urlParams.get("signature") ? urlParams.get("signature") : undefined;
        }

        const getMap = WMSCapabilitiesUtils.GetMap(capabilities.operations);
        let format= "image/png";
        if (getMap) {
          format = WMSCapabilitiesUtils.getPreferredFormat(getMap.supportedFormats);
        }

        const layerInfo = capabilities.layers[0].children[0];
        const referenceText = WMSCapabilitiesUtils.getPreferredProjection(roootLayer.supportedReferences);
        const model = {
          ...modelOptions,
          getMapRoot: cleanUrl,
          layers: layerInfo.name,
          referenceText,
          transparent: true,
          version: capabilities.version,
          imageFormat: format,
          requestParameters: {
            signature
          }
        };
        const unionBounds = WMSCapabilitiesUtils.simplifyBounds([layerInfo], referenceText);
        const layer = {
          label: layerInfo.name
        }
        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            fitBounds: unionBounds,
            layerType: UILayerTypes.WMSLayer,
            model,
            layer,
            autoZoom
          },
        }
        resolve(command);
      }
    })
  });
}

function CreateNewWFS(layerInfo: LayerInfoHxDR) {

  return new Promise<UICommand>((resolve, reject) => {

    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const modelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    WFSCapabilities.fromURL(modelOptions.url, modelOptions).then(capabilities=>{
      if (capabilities.featureTypes.length===1) {
        const cleanUrl = modelOptions.url.split('?')[0];
        const queryString = modelOptions.url.split('?')[1];
        let signature = undefined;

        if (queryString) {
          const urlParams = new URLSearchParams(queryString);
          signature = urlParams.get("signature") ? urlParams.get("signature") : undefined;
        }

        const layerInfo = capabilities.featureTypes[0];
        const referenceText = layerInfo.defaultReference;
        const model = {
          ...modelOptions,
          generateIDs: false,
          outputFormat: WFSCapabilitiesUtils.getPreferredFormat(layerInfo.outputFormats),
          swapAxes: false,
          swapQueryAxes: false,
          serviceURL: cleanUrl,
          postServiceURL: cleanUrl,
          referenceText,
          typeName: layerInfo.name,
          versions: [capabilities.version],
          methods: ["POST"],
          requestParameters: {
            signature
          }
        };
        const layer = {
          label: layerInfo.title,
          visible: true
        }
        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            layerType: UILayerTypes.WFSLayer,
            model,
            layer,
            autoZoom
          },
        }
        resolve(command);
      }
    })
  });
}


function CreateNewOGC3DTiles(layerInfo: LayerInfoHxDR) {
  return new Promise<UICommand>((resolve, reject) => {

    const baseUrl = electronBridge.hxdrServer.getUrl();
    const accessToken = getHxDRAccessToken();

    const modelOptions = {
      "HxDRAuth": {
        "assetId": layerInfo.id
      },
      "url": `${baseUrl}${layerInfo.endpoint}`,
      "credentials": false,
      "requestHeaders": {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    GetCapabilities3DTiles.fromURL(modelOptions.url, modelOptions).then(capabilities=>{
      if (capabilities.georeferenced) {
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
        const command: UICommand = {
          action: UICommandActions.CreateAnyLayer,
          parameters: {
            layerType: UILayerTypes.OGC3DTILES,
            model: modelOptions,
            layer: layerOptions,
            autoZoom
          },
        }
        resolve(command);
      } else {
        console.log("OGC 3D TilesLayer is not geroreferenced: " + layerInfo.name);
        reject();
      }
    })
  });
}

