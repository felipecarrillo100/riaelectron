import React from "react";
import {gql, useQuery} from "@apollo/client";
import {HxDRAssetRenderer} from "./HxDRAssetRenderer";
import {HxDRPAssetThumbnail} from "./HxDRProjectFoldersContainer";
import {HxDRFolderRenderer} from "./HxDRFolderRenderer";
import Glyphicon from "../../glyphicon/Glyphicon";
import {LayerInfoHxDR} from "../utils/CreateHxDRLayerCommand";


const GetFolderContents = gql`
    query getFolderContents($folderId: ID!, $foldersOrderBy: FolderOrderEnum!, $foldersPageNumber: Int!, $foldersPageSize: Int!, $assetsOrderBy: AssetOrderEnum!, $assetsPageNumber: Int!, $assetsPageOffset: Int!, $assetsPageSize: Int!) {
    getFolderContents: getFolder(folderId: $folderId) {
    ...Folder
    ...Filesystem
        __typename
    }
}

fragment Folder on FolderOutput {
    id
    modifiedAt
    createdAt
    description
    name
    includedFoldersSummary: folders(
        paging: {pageNumber: 0, pageOffset: 0, pageSize: 0}
) {
        total
        __typename
    }
    includedAssetsSummary: assets(
        paging: {pageSize: 10, pageNumber: 0, pageOffset: 0}
    filter: {not: {byAssetType: HXCP_PURCHASE}}
) {
        contents {
            id
            thumbnailPath
            __typename
        }
        total
        __typename
    }
...FolderTree
    __typename
}

fragment FolderTree on FolderOutput {
    isNestingLevelReached
    nestingLevel
    parentFolder {
        nestingLevel
        id
        name
        parentFolder {
            nestingLevel
            id
            name
            parentFolder {
                nestingLevel
                id
                name
                parentFolder {
                    nestingLevel
                    id
                    name
                    parentFolder {
                        nestingLevel
                        id
                        name
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }
    __typename
}

fragment Filesystem on FolderOutput {
    id
    folders(
        orderBy: $foldersOrderBy
    paging: {pageNumber: $foldersPageNumber, pageOffset: 0, pageSize: $foldersPageSize}
) {
        contents {
        ...Folder
            __typename
        }
        total
        appliedPagination {
            pageNumber
            pageOffset
            pageSize
            __typename
        }
        __typename
    }
    assets(
        orderBy: $assetsOrderBy
    paging: {pageNumber: $assetsPageNumber, pageOffset: $assetsPageOffset, pageSize: $assetsPageSize}
    filter: {not: {byAssetType: HXCP_PURCHASE}}
) {
        contents {
        ...Asset
            __typename
        }
        total
        appliedPagination {
            pageNumber
            pageOffset
            pageSize
            __typename
        }
        __typename
    }
    __typename
}

fragment Asset on GroupedAssetOutput {
    id
    folder {
        id
        __typename
    }
    assetSize
    name
    thumbnailPath
    createdAt
    modifiedAt
    createdBy {
        id
        email
        firstName
        lastName
        profilePictureUrl
        __typename
    }
    assetType
    assetStatus
    downloadLink
    asset {
        id
        jobSummary {
            jobs {
                type
                    state
                __typename
            }
            __typename
        }
        artifacts {
            contents {
            ...AssetArtifact
                __typename
            }
            __typename
        }
        __typename
    }
...AssetTree
    __typename
}

fragment AssetArtifact on ArtifactItemOutput {
    id
    type
        addresses {
        contents {
        ...AssetArtifactAddress
            __typename
        }
        __typename
    }
    __typename
}

fragment AssetArtifactAddress on AddressOutput {
... on Renderable {
        id
        endpoint
        type
            __typename
    }
... on AddressHspcOutput {
        processingPipelineInfo {
        ...ProcessingPipeline
            __typename
        }
        __typename
    }
... on AddressOgc3DOutput {
        processingPipelineInfo {
        ...ProcessingPipeline
            __typename
        }
        __typename
    }
... on AddressPanoramicOutput {
        label
        __typename
    }
... on AddressDownloadOutput {
        expirationDate
        label
        downloadType
        __typename
    }
    __typename
}

fragment ProcessingPipeline on ProcessingPipelineInfoOutput {
    id
    name
    status
    __typename
}

fragment AssetTree on GroupedAssetOutput {
    folder {
        id
        name
        isRootFolder
        parentFolder {
            id
            name
            isRootFolder
            parentFolder {
                id
                name
                isRootFolder
                parentFolder {
                    id
                    name
                    isRootFolder
                    parentFolder {
                        id
                        name
                        isRootFolder
                        parentFolder {
                            id
                            name
                            isRootFolder
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }
    __typename
}`;

interface Props {
    folderId: string;
    name: string;
    onItemSelected(properties: LayerInfoHxDR, index?: number): void;
    onItemSelectedDoubleClick?(properties: LayerInfoHxDR, index?: number): void;
    onSetThumbnail?(thumbnail: HxDRPAssetThumbnail): void;
    currentLayer: LayerInfoHxDR | null;
}

const HxDRFolderContentsRenderer: React.FC<Props> = (props: Props) => {

    const queryFolderContents = useQuery(GetFolderContents, {
        variables: {
            assetsOrderBy: "CREATED_AT_ASC",
            assetsPageNumber: 0,
            assetsPageOffset: 0,
            assetsPageSize: 1000,
            folderId: props.folderId,
            foldersOrderBy: "CREATED_AT_ASC",
            foldersPageNumber: 0,
            foldersPageSize: 1000
        },
        fetchPolicy: 'network-only'
    });

    const folders = queryFolderContents.data && queryFolderContents.data.getFolderContents ? queryFolderContents.data.getFolderContents.folders.contents : [];
    const assets = queryFolderContents.data && queryFolderContents.data.getFolderContents ? queryFolderContents.data.getFolderContents.assets.contents : [];

    return (
            <>
                {!queryFolderContents.loading ?
                    <ul>
                        {folders.map((folder: any)=>(<HxDRFolderRenderer key={folder.id} folderId={folder.id} name={folder.name}
                                                                         parentFolder={{id:props.folderId, name:props.name}}
                                                                         onItemSelected={props.onItemSelected}
                                                                         onItemSelectedDoubleClick={props.onItemSelectedDoubleClick}
                                                                         onSetThumbnail={props.onSetThumbnail}
                                                                         currentLayer={props.currentLayer}></HxDRFolderRenderer>))}
                        {assets.map((asset: any)=>(<HxDRAssetRenderer key={asset.id}
                                                                      asset={asset}
                                                                      parentFolder={{id:props.folderId, name: props.name}}
                                                                      onItemSelected={props.onItemSelected}
                                                                      onItemSelectedDoubleClick={props.onItemSelectedDoubleClick}
                                                                      onSetThumbnail={props.onSetThumbnail}
                                                                      currentLayer={props.currentLayer}
                        />))}
                    </ul> :
                    <ul>
                        <li>
                            <span className="icon-wrapper"><Glyphicon glyph="spinner" className="fast-right-spinner"/></span>
                            <span>Loading...</span>
                        </li>
                    </ul>
                }
            </>

    )
}
export {
    HxDRFolderContentsRenderer
}
