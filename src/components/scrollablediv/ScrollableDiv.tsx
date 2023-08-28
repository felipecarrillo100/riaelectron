import React from "react";
import Scrollbars from "replace-custom-scrollbars";

const DEFAULT_HEIGHT = 360;

function renderThumb(): any {
    const thumbStyle = {
        backgroundColor: "rgb(241,241,241)"
    };
    return (
        <div style={thumbStyle} />
    );
}

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    scrollheight?: number
}

class ScrollableDiv extends React.Component<Props> {

    render() {
        return (<div {...this.props}>
            <Scrollbars style={{ backgroundColor: "transparent", height: (this.props.scrollheight ? this.props.scrollheight : DEFAULT_HEIGHT)  }} renderThumbVertical={renderThumb} autoHide={true}>
                {this.props.children}
            </Scrollbars>
        </div>);
    }
}

export default ScrollableDiv;
