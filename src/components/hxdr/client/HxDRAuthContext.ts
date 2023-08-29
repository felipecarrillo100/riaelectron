import {createContext} from "react";
import {UICommand} from "../../../interfaces/UICommand";
import CustomContextMenu from "react-class-contexify";

export enum AuthState {
    Loading = "Loading",
    Authenticated = "Authenticated",
    NotAuthenticated = "NotAuthenticated",
}

interface HxDRAuthContextType {
    authenticated: AuthState;
    setAuthenticated: (v: AuthState) => void;
    command: UICommand | null;
    sendCommand:(v: UICommand) => void;
    contextMenu: CustomContextMenu | null;
};

export const HxDRAuthContext = createContext<HxDRAuthContextType>({} as any);
