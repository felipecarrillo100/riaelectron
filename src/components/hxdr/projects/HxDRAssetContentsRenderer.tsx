import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {gql, useQuery} from "@apollo/client";
import {HxDRProjectAssetLayer} from "./HxDRProjectFoldersContainer";
import Glyphicon from "../../../components/glyphicon/Glyphicon";

export const HxDRGetAssetDetails = gql`query getAssetDetails($id: ID!) {
  getAsset(groupedAssetId: $id) {
    ...AssetDetails
    __typename
  }
}

fragment AssetDetails on GroupedAssetOutput {
  id
  folder {
    id
    project {
      id
      projectMembers {
        contents {
          id
          projectRole
          userDetails {
            id
            __typename
          }
          __typename
        }
        __typename
      }
      ownedBy {
        ...AvatarRenderable
        companyInfo {
          id
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
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
  name
  assetSize
  thumbnailPath
  assetType
  downloadLink
  georeferences {
    pageNumber
    pageSize
    total
    contents {
      id
      latitude
      longitude
      altitude
      pitch
      yaw
      roll
      anchorX
      anchorY
      anchorZ
      scaleX
      scaleY
      scaleZ
      createdAt
      modifiedAt
      name
      flattenScale
      flattenEnabled
      visible {
        type
        visible
        __typename
      }
      __typename
    }
    __typename
  }
  labelAnnotations {
    ...LabelAnnotation
    __typename
  }
  limitingBoxAnnotations {
    ...LimitingBoxAnnotation
    __typename
  }
  measurementAnnotations {
    ...MeasurementAnnotation
    __typename
  }
  ...AssetProcessingStatus
  ...AssetPreview
  tours {
    contents {
      ...TourRenderable
      __typename
    }
    __typename
  }
  __typename
}

fragment AvatarRenderable on SimpleUserProfileOutput {
  id
  firstName
  lastName
  profilePictureUrl
  accountRole
  email
  __typename
}

fragment LabelAnnotation on LabelAnnotationOutput {
  id
  modifiedAt
  modifiedBy {
    id
    firstName
    lastName
    __typename
  }
  thumbnailPath
  createdAt
  createdBy {
    id
    firstName
    lastName
    __typename
  }
  title
  description
  data {
    position {
      x
      y
      z
      __typename
    }
    lookAt {
      distance
      pitch
      yaw
      roll
      ref {
        x
        y
        z
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment LimitingBoxAnnotation on LimitingBoxAnnotationOutput {
  id
  modifiedAt
  modifiedBy {
    id
    firstName
    lastName
    __typename
  }
  thumbnailPath
  createdAt
  createdBy {
    id
    firstName
    lastName
    __typename
  }
  title
  description
  data {
    maxX
    maxY
    maxZ
    minX
    minY
    minZ
    rotation {
      x
      y
      z
      __typename
    }
    lookAt {
      distance
      pitch
      yaw
      roll
      ref {
        x
        y
        z
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment MeasurementAnnotation on MeasurementAnnotationOutput {
  id
  modifiedAt
  modifiedBy {
    id
    firstName
    lastName
    __typename
  }
  thumbnailPath
  createdAt
  createdBy {
    id
    firstName
    lastName
    __typename
  }
  title
  description
  data {
    lookAt {
      distance
      pitch
      yaw
      roll
      ref {
        x
        y
        z
        __typename
      }
      __typename
    }
    measurementType
    points {
      x
      y
      z
      __typename
    }
    __typename
  }
  __typename
}

fragment AssetProcessingStatus on GroupedAssetOutput {
  id
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
    __typename
  }
  __typename
}

fragment AssetPreview on GroupedAssetOutput {
  id
  asset {
    withEmbeddedGeoreference
    anchorPoint {
      x
      y
      z
      __typename
    }
    artifacts {
      contents {
        type
        addresses {
          contents {
            ... on AddressOgc3DOutput {
              endpoint
              type
              __typename
            }
            ... on AddressHspcOutput {
              endpoint
              type
              __typename
            }
            ... on AddressLtsOutput {
              endpoint
              type
              __typename
            }
            ... on AddressWfsOutput {
              endpoint
              type
              __typename
            }
            ... on AddressWmsOutput {
              endpoint
              type
              __typename
            }
            ... on AddressWmtsOutput {
              endpoint
              type
              __typename
            }
            ... on AddressPanoramicOutput {
              endpoint
              id
              label
              type
              __typename
            }
            ... on AddressDownloadOutput {
              id
              type
              expirationDate
              label
              downloadType
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
    files {
      contents {
        files {
          downloadLink
          __typename
        }
        __typename
      }
      __typename
    }
    referencedBounds {
      cartesianBounds {
        origin {
          x
          y
          z
          __typename
        }
        dimensions {
          width
          height
          depth
          __typename
        }
        __typename
      }
      originGeolocation {
        longitude
        latitude
        height
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment TourRenderable on GroupedAssetTourOutput {
  id
  name
  description
  duration
  canEdit
  closed
  tension
  createdAt
  modifiedAt
  createdBy {
    ...UserRenderable
    __typename
  }
  keyframes {
    ...KeyframeRenderable
    __typename
  }
  thumbnailPath
  __typename
}

fragment UserRenderable on SimpleUserProfileOutput {
  id
  firstName
  lastName
  profilePictureUrl
  accountRole
  email
  __typename
}

fragment KeyframeRenderable on GroupedAssetTourKeyframeOutput {
  id
  durationFromTourStart
  tension
  cameraViewpoint {
    ...CameraViewpointRenderable
    __typename
  }
  properties {
    ...PropertiesRenderable
    __typename
  }
  __typename
}

fragment CameraViewpointRenderable on TourCameraViewpointOutput {
  eyePosition {
    ...vectorRenderable
    __typename
  }
  forward {
    ...vectorRenderable
    __typename
  }
  up {
    ...vectorRenderable
    __typename
  }
  __typename
}

fragment vectorRenderable on Vector3Output {
  x
  y
  z
  __typename
}

fragment PropertiesRenderable on GroupedAssetPropertiesOutput {
  selectedLimitingBoxAnnotation
  visibleArtifacts
  visibleLabelAnnotations
  visibleMeasurementAnnotations
  __typename
}`;

interface Props {
    asset: {
        id: string;
        name: string;
        thumbnailPath: string;
    };
    onItemSelected(properties: HxDRProjectAssetLayer, index?: number): void;
    onItemSelectedDoubleClick?(properties: HxDRProjectAssetLayer, index?: number): void;
    currentLayer: HxDRProjectAssetLayer | null;
}


const HxDRAssetContentsRenderer: React.FC<Props> = (props: Props) => {
    const queryAsset = useQuery(HxDRGetAssetDetails, {
        variables: {
            id: props.asset.id,
        },
        fetchPolicy: 'network-only'
    });

    const rows = (queryAsset.data && queryAsset.data.getAsset && queryAsset.data.getAsset.asset.artifacts ) ?
        queryAsset.data.getAsset.asset.artifacts.contents.filter((item:any)=>item.type!=="UNDEFINED").map((item: any)=>({
                    "type": item.type,
                    "addresses": item.addresses
        })) : [];

    const endpointType = (addresses: any) => {
        const endpoint = {
            type: null as string | null,
            endpoint: ""
        }
        for (const address of addresses) {
            if (address.type === "HSPC" || address.type === "OGC_3D_TILES" || address.type === "PANORAMIC") {
                endpoint.type = address.type;
                endpoint.endpoint = address.endpoint;
                break;
            }
        }
        return endpoint;
    }

    const itemClicked = (row: any) => () => {
        if (typeof props.onItemSelected === "function") {
            const mode = endpointType(row.addresses.contents);
            if (mode.type!==null) {
                const data: HxDRProjectAssetLayer = {
                    id: props.asset.id,
                    thumbnailPath: props.asset.thumbnailPath,
                    name: props.asset.name + ` (${row.type})`,
                    type: mode.type as any,
                    endpoint: mode.endpoint
                }
                props.onItemSelected(data);
            }
        }
    }

    const itemDoubleClicked = (row: any) => () => {
        if (typeof props.onItemSelected === "function") {
            const mode = endpointType(row.addresses.contents);
            if (mode.type!==null) {
                const data: HxDRProjectAssetLayer = {
                    id: props.asset.id,
                    thumbnailPath: props.asset.thumbnailPath,
                    name: props.asset.name + ` (${row.type})`,
                    type: mode.type as any,
                    endpoint: mode.endpoint
                }
                if (typeof props.onItemSelectedDoubleClick==="function") props.onItemSelectedDoubleClick(data);
            }
        }
    }

    return (
        <>
            { !queryAsset.loading ?
                <ul>
                    {rows.map((row:any)=>{
                            let active = "";
                            if (props.currentLayer) {
                                const mode = endpointType(row.addresses.contents);
                                if (
                                    props.currentLayer && props.currentLayer &&
                                    props.currentLayer.id === props.asset.id && props.currentLayer.type === mode.type
                                ) {
                                    active = " active" ;
                                }
                            }
                            return (
                            <li key={row.type} >
                                <div className={"asset" + active} onClick={itemClicked(row)} onDoubleClick={itemDoubleClicked(row)}>
                                    <span className="icon-wrapper" >
                                        <FontAwesomeIcon className="FontAwesomeIcon-class" icon="external-link-alt" />
                                    </span>
                                    {row.type}
                                </div>
                            </li>)
                    }
                    )}
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
    HxDRAssetContentsRenderer
}
