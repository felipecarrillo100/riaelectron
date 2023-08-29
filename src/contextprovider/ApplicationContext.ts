import {createContext} from "react";
import {UICommand} from "../interfaces/UICommand";
import CustomContextMenu from "react-class-contexify";

export enum AuthState {
    Loading = "Loading",
    Authenticated = "Authenticated",
    NotAuthenticated = "NotAuthenticated",
}

interface ApplicationContextType {
    authenticated: AuthState;
    setAuthenticated: (v: AuthState) => void;
    command: UICommand | null;
    sendCommand:(v: UICommand) => void;
    contextMenu: CustomContextMenu | null;
};

export const ApplicationContext = createContext<ApplicationContextType>({} as any);
