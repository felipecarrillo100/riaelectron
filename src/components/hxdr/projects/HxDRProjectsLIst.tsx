import React, {useEffect, useRef, useState} from "react";

import {gql, useQuery} from "@apollo/client";
import {FormControl, FormGroup, FormLabel, InputGroup} from "react-bootstrap";

import Pagination from "replace-js-pagination";
import {ProjectsTableSelect} from "./ProjectsTableSelect";

const GetProjects = gql`
query getProjects( $filterByName: String, $orderBy: ProjectOrderEnum, $pageSize: Int = 24, $pageNumber: Int = 0) 
{
    getProjects(params: {paging: {pageNumber: $pageNumber, pageSize: $pageSize}, filter: {byProjectName: $filterByName}, orderBy: $orderBy} ) {
          total
          pageSize
          contents {
                ...Project
                __typename
                }
                __typename
              }
          }
          fragment Project on ProjectOutput {
              id
              name
              description
              createdAt
              modifiedAt
          rootFolder {
              id
              __typename
            }
          thumbnailPath
          totalAssets
          projectMembers {
             contents {
                   id
                   userDetails {
                   id
                   email
                   firstName
                   lastName
                   profilePictureUrl
                   accountRole
                   jobTitle
                   companyInfo {
                     id
                     company
                     __typename
                     }
                 __typename
             }
             invitedBy {
               id
               firstName
               lastName
               __typename
               }
           invitedOn
           projectRole
           __typename
           }
           __typename
           }
           ownedBy {
             id
             signedUpAt
             jobTitle
             firstName
             lastName
             profilePictureUrl
             accountRole
             email
             companyInfo {
               id
               company
               __typename
               }
               __typename
               }
               __typename
               }
`
;

export interface HxDRProjectItem {
    createdAt : string;
    description: string;
    id: string;
    modifiedAt: string;
    name: string;
    rootFolder: {
        id: string;
        __typename: string
    }
}


interface Props {
    project: HxDRProjectItem;
    setProject: (s: HxDRProjectItem | null) => void;
}

const pageSize = 10;
const pageRangeDisplayed = 5;

const HxDRProjectsLIst: React.FC<Props> = (props: Props) => {

    const [projectName, setProjectName] = useState("");
    const [activePage, setActivePage] = useState(0);
    const oldTotal = useRef(0);

    const { data, loading } = useQuery(GetProjects, {
        variables: {
            pageSize: pageSize,
            pageNumber: activePage,
            filterByName: projectName,
            orderBy: "CREATED_AT_ASC"
        },
        fetchPolicy: 'network-only'
    });
    const rows = data && data.getProjects && data.getProjects.contents ? data.getProjects.contents : [];

    const projectItems: HxDRProjectItem[] = rows.map((projectItem:any)=>({
        createdAt : projectItem.createdAt,
        description: projectItem.description,
        id: projectItem.id,
        modifiedAt: projectItem.modifiedAt,
        name: projectItem.name,
        rootFolder: JSON.parse(JSON.stringify(projectItem.rootFolder))
    }));

    const handleChange = (event: any) => {
        const {
            target: { value },
        } = event;
        const projectFound = projectItems.find((item:any)=>item.id === value);
        if (projectFound) {
            props.setProject( projectFound );
        }
    };

    useEffect(()=>{
        if(!loading) {
            if (projectItems.length>0) {
                props.setProject(
                    projectItems[0],
                );
            } else {
                props.setProject(null);
            }
        }
    }, [loading]);

    const total = (data && data.getProjects) ? data.getProjects.total : 0;
    if (data && data.getProjects && oldTotal.current !== total) {
        oldTotal.current = total;
    }
    const changePaginationCurrentPage = (pageNumber: number) => {
        setActivePage(pageNumber-1);
    }
    const searchTextHandle = (event: any) => {
        const {
            target: { value },
        } = event;
        setProjectName(value);
        setActivePage(0);
    };

    return (
        <>
            <FormGroup controlId="hxdr-project-filter-id">
                <FormLabel>
                    Search by project name
                </FormLabel>
                <InputGroup >
                        <InputGroup.Text>
                            F
                        </InputGroup.Text>
                    <FormControl
                        type="search"
                        value={projectName} onChange={searchTextHandle}
                         placeholder={"Enter project name"}
                    />
                </InputGroup>
            </FormGroup>

            <FormGroup controlId="hxdr-select-project-id">
                <FormLabel>
                   Select a project: ({ !loading ? ""+ projectItems.length + "/" + total : "..."})
                </FormLabel>
                <ProjectsTableSelect name="project" project={props.project} handleChange={handleChange} projectItems={projectItems} loading={loading} />
            </FormGroup>

            {<Pagination
                itemClass="page-item"
                linkClass="page-link"
                activePage={activePage+1}
                itemsCountPerPage={pageSize}
                totalItemsCount={oldTotal.current}
                pageRangeDisplayed={pageRangeDisplayed}
                onChange={changePaginationCurrentPage}
            />}
        </>
    )
}

export default HxDRProjectsLIst;
