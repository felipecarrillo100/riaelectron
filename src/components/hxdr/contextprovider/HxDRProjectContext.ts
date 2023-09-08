import {createContext} from "react";
import {HxDRProjectItem} from "../projects/HxDRProjectsLIst";

export enum AuthState {
    Loading = "Loading",
    Authenticated = "Authenticated",
    NotAuthenticated = "NotAuthenticated",
}

export interface HxDRRefreshCommand {
    type: "REFRESH",
    target: string;
}

interface HxDRProjectContextType {
    project: HxDRProjectItem | null;
    setProject: (valu:HxDRProjectItem | null)=>void;
    refreshCommand: HxDRRefreshCommand | null;
    emitRefreshCommand: (valu:HxDRRefreshCommand | null)=>void;
};

export const HxDRProjectContext = createContext<HxDRProjectContextType>({} as any);
