import {useEffect, useRef} from "react";
import "./LuciadMap.css";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

const LuciadMap: React.FC = () => {
    const elem = useRef(null as HTMLDivElement | null);

    useEffect(()=>{
        if (elem.current) {
            const reference = getReference("epsg:4978");
            new WebGLMap(elem.current, {reference})
        }
    }, [elem])

    return <div ref={elem} className="LuciadMap"/>
}

export {
    LuciadMap
}
