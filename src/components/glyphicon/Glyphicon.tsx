import * as React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

import "./Glyphicon.scss";

const faDataset = {
    "industry": "industry",
    "flask": "flask",
    "heart": "heart",
    "remove": "times",
    "globe": "globe",
    "cog": "cog",
    "picture": "image",
    "shopping-cart": "shopping-cart",
    "user" : "user",
    "filter" : "filter",
    "trash": "trash",
    "paste": "paste",
    "caret-down": "caret-down",
    "caret-up": "caret-up",
    "info-sign": "info",
    "question-sign": "question",
    "exclamation-sign": "exclamation",
    "ok": "check",
    "lock": "lock",
    "copy": "copy",
    "clock": "clock",
    "spinner": "spinner",
    "floppy-open": "save",
    "glyphicon-paste": "paste",
    "glyphicon-th": "border-none",
    "glyphicon-equalizer": "braille",
    "equalizer": "braille",
    "eye-open": "eye",
    "eye-close": "eye-slash",
    "pencil": "pen",
    "search": "search",
    "ban-circle": "ban",
    "ok-circle": "check",
    "upload": "upload",
    "download": "download",
    "file": "file",
    "compressed": "file-archive",
    "book": "book",
    "folder-open": "folder-open",
    "list-alt": "list",
} as { [key: string]: string; };

interface Props {
    glyph: string;
    style?: any;
    title?: string;
    placeholder?: string;
    color?: string;
    className?: string;
}

// const GroupIcon = (<FontAwesomeWrapper><FontAwesomeIcon className="FontAwesomeIcon-class" icon="file-archive"/></FontAwesomeWrapper>);

class Glyphicon extends React.Component<Props, any>{
    render() {
        let color = this.props.color ? this.props.color : "white";
        const defaultClass = "Emulated-Glyphicon";
        const className = this.props.className ? defaultClass + ' ' + this.props.className : defaultClass;

        const icon = Glyphicon.split(this.props.glyph);

        if (icon.attribute==="text-warning" ) {
            color = "rgba(255,0,0,1)";
        }
        return (
            <FontAwesomeIcon className={className} icon={Glyphicon.dictionary(icon.glyph)} color={color} style={this.props.style}/>
        );
    }

    private static split(glyphicon: string) {
        const parts = glyphicon.split(" ");
        const glyph = parts[0];
        const attribute = parts.length>1 ? parts[1] : "";
        return { glyph, attribute};
    }

    private static dictionary(glyph: string) {
        return faDataset[glyph] as IconProp;
    }
}

export default Glyphicon;
