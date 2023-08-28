import React from "react";
import "./HxDRPanel.css"

export const HxDRPanel: React.FC = () => {
    return (
        <>
            <div className="PanelTop">
                <h6>HxDR Projects</h6>
                <div className="hxdr-panel"></div>
            </div>
            <div className="PanelBottom">
                <h6>Folders</h6>
                <div className="hxdr-panel"></div>
            </div>
        </>
    )
}
