import {LayerType} from "@luciad/ria/view/LayerType";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {FusionPanoramaModel} from "@luciad/ria/model/tileset/FusionPanoramaModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {PanoramaFeaturePainter} from "../painters/PanoramaFeaturePainter";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {LayerTreeVisitor} from "@luciad/ria/view/LayerTreeVisitor";
import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel";
import {PointCloudPointShape} from "@luciad/ria/view/style/PointCloudPointShape";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {Layer} from "@luciad/ria/view/Layer";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {Bounds} from "@luciad/ria/shape/Bounds";

class LayerFactory {
    public static createBingmapsLayer(bingModel:BingMapsTileSetModel, command: any) {
        let options = {...command};
        return new Promise<RasterTileSetLayer>((resolve, reject) => {
            if (typeof options === "undefined") {
                options = {}
            }
            options.label = options.label ? options.label : "Bingmaps";
            options.layerType = options.layerType ? options.layerType : LayerType.STATIC;
            const layer = new RasterTileSetLayer(bingModel, options);
            if (layer) {
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    public static createOgc3DTilesLayer(model: OGC3DTilesModel, layerOptions: any) {
        let options = {...layerOptions};

        return new Promise<TileSet3DLayer>((resolve, reject) => {
            if (typeof options === "undefined") {
                options = {}
            }
            options.label = options.label ? options.label : "OGC 3D tiles";
            options.selectable = options.selectable ? options.selectable : true;
            options.transparency = options.transparency ? options.transparency : false;
            options.layerType = options.layerType ? options.layerType : LayerType.STATIC;
            options.qualityFactor = typeof options.qualityFactor !== "undefined" ? options.qualityFactor : 1.0;
            options.offsetTerrain = typeof options.offsetTerrain !== "undefined" ? options.offsetTerrain : true;

            const layer:TileSet3DLayer = new TileSet3DLayer(model, options);
            if (layer) {
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    static async createHSPCLayer(model: HSPCTilesModel, layerOptions: any) {
        let options = {...layerOptions};

        return new Promise<TileSet3DLayer>((resolve, reject) => {
            if (typeof options === "undefined") {
                options = {}
            }
            options.label = options.label ? options.label : "OGC 3D tiles";
            options.selectable = options.selectable ? options.selectable : true;
            options.transparency = options.transparency ? options.transparency : false;
            options.layerType = options.layerType ? options.layerType : LayerType.STATIC;
            options.qualityFactor = typeof options.qualityFactor !== "undefined" ? options.qualityFactor : 1.0;
            options.offsetTerrain = typeof options.offsetTerrain !== "undefined" ? options.offsetTerrain : true;
            options.pointCloudStyle = {pointShape: PointCloudPointShape.DISC, pointSize: {mode: ScalingMode.PIXEL_SIZE, pixelSize: 2.0}};

            const layer:TileSet3DLayer = new TileSet3DLayer(model, options);
            if (layer) {
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    public static createPanoramicsLayer(model: FeatureModel, layerOptions: any, modelOptions: any) {
        let options = {...layerOptions};
        return new Promise<FeatureLayer>((resolve, reject)=>{
            if (typeof options === "undefined") {
                options = {}
            }
            const target =  modelOptions.url;
            const panoModel = new FusionPanoramaModel(target, {
                credentials: modelOptions.credentials,
                requestHeaders: modelOptions.requestHeaders
            });

            const layer = new FeatureLayer(model, {
                ...options,
                panoramaModel: panoModel,
                selectable: false,
                painter:new PanoramaFeaturePainter({
                    overview: false,
                    iconHeightOffset: Number(options.iconHeightOffset) // sensor height in meters above street level (approx)
                })
            });
            if (layer) {
                resolve(layer);
            } else {
                reject();
            }
        })
    }


    static isFusionPanoramaLayer(layer: any) {
        return layer instanceof FeatureLayer && layer.panoramaModel && layer.painter instanceof PanoramaFeaturePainter;
    }
    static findFusionPanoramaLayers(map: WebGLMap) {
        const layers: FeatureLayer[] = [];
        if (map && map.layerTree) {
            const layerTreeVisitor = {
                visitLayer: (layer: any) => {
                    if (layer instanceof FeatureLayer && layer.panoramaModel && layer.painter instanceof PanoramaFeaturePainter) {
                        layers.push(layer);
                    }
                    return LayerTreeVisitor.ReturnValue.CONTINUE;
                },
                visitLayerGroup: (layerGroup: any) => {
                    layerGroup.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
                    return LayerTreeVisitor.ReturnValue.CONTINUE;
                }
            };
            map.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
        }
        return layers;
    }


    static async createWMSLayer(model: WMSTileSetModel, layerOptions: any) {
        return new Promise<WMSTileSetLayer>((resolve)=>{
            const layer = new WMSTileSetLayer(model, layerOptions)
            resolve(layer);
        })
    }

    static async getLayerBounds(aLayer: Layer) {
        return new Promise<Bounds> ((resolve, reject) => {
            const layer = aLayer as any;
            if (typeof layer.restoreCommand !== "undefined") {
                const fitBounds = layer.restoreCommand.fitBounds;
                const ref = getReference(layer.restoreCommand.fitBounds.reference);
                const coordinates = fitBounds.coordinates;
                const bounds = createBounds(ref, coordinates);
                resolve(bounds);
            } else {
                if (layer instanceof  FeatureLayer) {
                    const queryFinishedHandle = layer.workingSet.on("QueryFinished", () => {
                        if (layer.bounds) {
                            resolve(layer.bounds);
                        } else {
                            reject();
                        }
                        queryFinishedHandle.remove();
                    });
                } else {
                    resolve(layer.bounds);
                }
            }
        } )
    }
}

export {
    LayerFactory
}
