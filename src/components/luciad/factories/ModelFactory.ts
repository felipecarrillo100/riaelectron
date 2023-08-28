import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {UrlStore} from "@luciad/ria/model/store/UrlStore";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";

class ModelFactory {
    public static createBingmapsModel(command: any) {
        return new Promise<BingMapsTileSetModel>((resolve, reject) => {
            let options = {...command};
            if (typeof options === "undefined") {
                options = {
                    imagerySet: "",
                    token: ""
                };
            }
            let template = "https://dev.virtualearth.net/REST/v1/Imagery/Metadata/%MAPID%?key=%TOKEN%&include=ImageryProviders";
            if (options.useproxy) {
                const proxyURL = "Enter Bingmaps proxy here";
                template = proxyURL +"/%MAPID%";
            }
            let requestStr = template.replace("%MAPID%", options.imagerySet);
            requestStr = requestStr.replace("%TOKEN%", options.token);

            ModelFactory.GET_JSON(requestStr).then(
                (response)=>{
                    if (response.status === 200) {
                        response.json().then(data=>{
                            let resource;
                            if (data.resourceSets[0] && data.resourceSets[0].resources[0]) {
                                resource = data.resourceSets[0].resources[0];
                                // Serve tiles over https://
                                if (resource.imageUrl.indexOf("http://ecn.") > -1) {
                                    resource.imageUrl = resource.imageUrl.replace("http:", "https:");
                                }
                                if (resource.imageUrl.indexOf("http://ak.dynamic.") > -1) {
                                    resource.imageUrl = resource.imageUrl.replace("{subdomain}.", "");
                                    resource.imageUrl = resource.imageUrl.replace("http://", "https://{subdomain}.ssl.");
                                }
                                resource.brandLogoUri = data.brandLogoUri;
                            } else {
                                resource = data;
                            }
                            const model = new BingMapsTileSetModel(resource);
                            resolve(model);
                        })
                    } else {
                        const reason = {type:"error", message:"Failed to create layer. Bing Maps service unreachable"}
                        reject(reason);
                    }
                },
                () => {
                    const reason = {type:"error", message:"Failed to create layer. Bing Maps service unreachable"}
                    reject(reason);
                }
            );
        });
    }

    public static createOgc3DTilesModel(OGC3DTilesSettings: any) {
        return new Promise<OGC3DTilesModel>((resolve, reject) => {
            OGC3DTilesModel.create(OGC3DTilesSettings.url, OGC3DTilesSettings).then((model) => {
                if (model && model.modelDescriptor && model.modelDescriptor.type === "OGC3D") {
                    resolve(model);
                } else {
                    reject(null);
                }
            }, () => {
                reject();
            });
        });
    }

    public static createPanoramicsModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const crs = modelOptions.crs ? modelOptions.crs : "CRS:84";
            const reference = getReference(crs);
                const store = new UrlStore({
                    target: modelOptions.url,
                    credentials: modelOptions.credentials,
                    requestHeaders: modelOptions.requestHeaders,
                    accepts: modelOptions.requestHeaders.Accept,
                    reference
                });
                const model = new FeatureModel(store, {
                    reference
                });
                resolve(model);
        });
    }

    private static GET_JSON_BACKEND(url: string) {
        return fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // no-referrer, *client
        })
    }

    private static GET_JSON(url: string) {
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        } as any;
        return fetch(url, requestOptions);
    }

    static async createHSPCModel(modelOptions: any) {
        return new Promise<HSPCTilesModel>((resolve, reject) => {
            HSPCTilesModel.create(modelOptions.url, modelOptions).then((model) => {
                if (model && model.modelDescriptor && model.modelDescriptor.type === "HSPC") {
                    resolve(model);
                } else {
                    reject(null);
                }
            }, () => {
                reject();
            });
        });
    }

    static async createWMSModel(modelOptions: any) {
        return new Promise<WMSTileSetModel>((resolve, reject)=> {
            const model = new WMSTileSetModel({
                getMapRoot: modelOptions.getMapRoot,
                version: modelOptions.version ? modelOptions.version : "1.3.0",
                reference: getReference(modelOptions.referenceText),
                layers: modelOptions.layers,
                transparent: typeof modelOptions.transparent !== "undefined" ? modelOptions.transparent : false,
                imageFormat: typeof modelOptions.imageFormat !== "undefined" ? modelOptions.imageFormat : "image/png",
            });
            resolve(model);
        })
    }


}

export {
    ModelFactory
}
