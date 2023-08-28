import {Layer} from "@luciad/ria/view/Layer";
import {ModelFactory} from "./ModelFactory";
import {LayerFactory} from "./LayerFactory";
import {WorkspaceBuilderAction} from "../../../interfaces/WorkspaceBuilderAction";
import {CreateLayerInfo} from "../../../interfaces/CreateLayerInfo";

export function CreateNewLayer(layerInfo: CreateLayerInfo) {
    async function createWMSLayer (layerInfo: CreateLayerInfo) {
        const model = await ModelFactory.createWMSModel(layerInfo.model);
        const layer = await LayerFactory.createWMSLayer(model, layerInfo.layer);
        (layer as any).restoreCommand = layerInfo;
        return layer;
    };
    return new Promise<Layer>((resolve, reject)=> {
        switch (layerInfo.layerType) {
            case WorkspaceBuilderAction.WMSLayer:
            {
                const layer =  createWMSLayer(layerInfo);
                if (layer) resolve(layer); else reject();
            }
                break
        }
    })
}
