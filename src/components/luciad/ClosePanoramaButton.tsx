import React from "react";
import {Button} from "react-bootstrap";

interface Props {
    onClick: ()=>void;
}
const ClosePanoramaButton: React.FC<Props> = (props: Props) => {
    const onButtonClick = ()=>{
        props.onClick();
    }
    return (
        <Button variant="primary" size="sm" onClick={onButtonClick} style={{pointerEvents:"all"}}>Close Panorama</Button>
    )
}

export {
    ClosePanoramaButton
}
