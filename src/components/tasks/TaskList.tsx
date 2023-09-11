import React, {useEffect, useState} from "react";
import {electronBridge} from "../../electronbridge/Bridge";
import {Table} from "react-bootstrap";

// assets: this.assetsRepository,
//     files: this.filesRepository,
//     chunks: this.chunksRepository,

const StatusStr = {
    "0": "New",
    "1": "Processing",
    "2": "Uploading",
    "3": "Completed",
    "5": "Uploaded",
}

interface DBUpdate {
    success: boolean;
    values: any;
    refresh: {
        type: string;
        repository: string;
        query: any;
    }
}
export const TaskList: React.FC = () => {
    const [dbUpdate, emitDBUpdate] = useState(null as DBUpdate | null);

    const [queryResult, setQueryResult] = useState(null as any);

    useEffect(()=>{
        if (dbUpdate && dbUpdate.refresh) {
            if (dbUpdate.refresh.repository ==="assets") {
                if (dbUpdate.refresh.type==="queryLike") setQueryResult(dbUpdate.values);
            }
        }
    }, [dbUpdate])

    useEffect(()=>{
        electronBridge.ipcRenderer.on("db-feedback", (options)=>{
            if (options.refresh) {
                emitDBUpdate(options);
            }
        });
        sendQuery();
        return ()=>{}
    }, [])

    const sendQuery = () => {
        const query = {
            type: "queryLike",
            repository: "assets",
            query: {}
        }
        electronBridge.ipcRenderer.send("db-query", query);
    }

    const deleteItem = (e:any) => () => {
        const query = {
            type: "deleteItem",
            repository: "assets",
            id: e._id
        }
        electronBridge.ipcRenderer.send("db-query", query);
    }

    const getStatusString = (status: number): string => {
        if (status<0) return "Failed";
        // @ts-ignore
        return StatusStr[status.toString()];
    }

    let renderItems = [];
    if (queryResult) {
        renderItems = queryResult.items.map((e:any)=>(
            <tr>
                <td>{e._id}</td>
                <td><a href="#">{e._assetName}</a></td>
                <td>{e._assetId}</td>
                <td>{getStatusString(e._status)}</td>
                <td><button onClick={deleteItem(e)}>Delete</button></td>
            </tr>))
    }



    return (<div>
        <p>List</p>
        <button onClick={sendQuery}>Query</button>

        <Table striped bordered hover>
            <thead>
            <tr>
                <th>#</th>
                <th>AssetName</th>
                <th>AssetId</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
                {renderItems}
            </tbody>
        </Table>
    </div>)
}
