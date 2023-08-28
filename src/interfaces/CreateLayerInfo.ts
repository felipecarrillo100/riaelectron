import {WorkspaceBuilderAction} from "./WorkspaceBuilderAction";

export interface CreateLayerInfo {
    fitBounds: any;
    layerType: WorkspaceBuilderAction,
    model: any;
    layer: any;
    autoZoom: boolean;
}
