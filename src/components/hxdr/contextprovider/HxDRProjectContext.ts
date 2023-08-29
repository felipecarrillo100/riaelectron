import {createContext} from "react";
import {HxDRProjectItem} from "../projects/HxDRProjectsLIst";

export enum AuthState {
    Loading = "Loading",
    Authenticated = "Authenticated",
    NotAuthenticated = "NotAuthenticated",
}

interface HxDRProjectContextType {
    project: HxDRProjectItem | null;
    setProject: (valu:HxDRProjectItem | null)=>void;
};

export const HxDRProjectContext = createContext<HxDRProjectContextType>({} as any);
