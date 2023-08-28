import {createContext} from "react";

export enum AuthState {
    Loading = "Loading",
    Authenticated = "Authenticated",
    NotAuthenticated = "NotAuthenticated",
}

interface HxDRAuthContextType {
    authenticated: AuthState;
    setAuthenticated: (v: AuthState) => void;
};

export const HxDRAuthContext = createContext<HxDRAuthContextType>({} as any);
