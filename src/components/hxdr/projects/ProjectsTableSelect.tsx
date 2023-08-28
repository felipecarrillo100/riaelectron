import {HxDRProjectItem} from "./HxDRProjectsLIst";
import React from "react";
import {Col, Row} from "react-bootstrap";


interface Props {
    project: HxDRProjectItem;
    projectItems: HxDRProjectItem[];
    handleChange: (event: any) => void;
    name: string;
    loading: boolean;
}

const ProjectsTableSelect: React.FC<Props> = (props: Props) => {
    const selectItem = (row: HxDRProjectItem, index: any) => (event: any) => {
        if (typeof props.handleChange === "function") {
            const syntheticEvent = {
                target: {
                    name: props.name,
                    value: row.id
                }
            }
            props.handleChange(syntheticEvent);
        }
    }
    return (
        <div className="ttable">
            <div className="theader">
                <Row>
                    <Col sm={12} >
                        Available Projects
                    </Col>
                </Row>
            </div>
            <div style={{color:"white"}} className="main-container">
                {props.projectItems.length >0 ?
                    <div className="tbody">
                        {props.projectItems.map((row: HxDRProjectItem, index: number) => {
                            const selected = props.project && row.id === props.project.id;
                            return (
                                <Row
                                    key={""+row.id+"-fix-"+index}
                                    onClick={selectItem(row, index)}
                                    title={row.description}
                                    className={selected? "selected": undefined}
                                >
                                    <Col sm={12}><div className="title-flex">{row.name}</div></Col>
                                </Row>
                            )})}
                    </div> :
                    <div className="ebody">
                        <Row>
                            { props.loading ?
                                <Col sm={12}>...Loading...</Col>
                                :
                                <Col sm={12}>...Empty...</Col>
                            }
                        </Row>
                    </div>
                }
            </div>
        </div>

    )
}

export {
    ProjectsTableSelect
}

