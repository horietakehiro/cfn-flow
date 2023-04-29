import { GridRowId } from "@mui/x-data-grid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, Node, NodeChange, OnConnect, OnEdgesChange, OnNodesChange, ReactFlowInstance } from 'reactflow';
import { create } from 'zustand';
import { RootState } from "../../store";

export interface FlowsState {
    flows: Flow[]
}
export interface SelectedFlowState {
    flow: Flow | null
}
export interface NodeEditDrawerState {
    opened: boolean
}
export interface SelectedNodeState {
    node: StackNode | null
}
export interface EditIODialogState {
    opened: boolean
    type: "Parameters" | "Outputs" | null
} 
// export interface EditParameterSourceDialogState {
//     opened: boolean
// }
// export interface EditOutputTargetDialogState {
//     opened: boolean
// }
export interface ParameterRowSelectionModelState {
    rowIds: GridRowId[]
}
export interface OutputRowSelectionModelState {
    rowIds: GridRowId[]
}
export interface ReactFlowInstanceState {
    reactFlowInstance: ReactFlowInstance | null
}
// export interface FlowState = {

// }

const FlowsInitialState: FlowsState = {
    flows: []
}
const selectedFlowInitialState: SelectedFlowState = {
    flow: null
}
const NodeEditDrawerInitialState: NodeEditDrawerState = {
    opened: false
}
const SelectedNodeInitialState: SelectedNodeState = {
    node: null
}
const EditIODialogInitialState: EditIODialogState = {
    opened: false,
    type: null
}
// const EditParameterSourceDialogInitialState: EditParameterSourceDialogState = {
//     opened: false
// }
// const EditOutputTargetDialogInitialState: EditOutputTargetDialogState = {
//     opened: false
// }
const ParameterRowSelectionModelInitialState: ParameterRowSelectionModelState = {
    rowIds: []
}
const OutputRowSelectionModelInitialState: OutputRowSelectionModelState = {
    rowIds: []
}
const ReactFlowInstanceInitialState: ReactFlowInstanceState = {
    reactFlowInstance: null
}
export type RFState = {
    nodes: Node[]
    edges: Edge[]
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect

    mergeNodes: (nodes: Node[]) => void
    updateNode: (node: Node) => void
    initNodes: (nodes: Node[]) => void
    deleteNode: (node: Node) => void

    // addEdge: (edge: Edge) => void
    initEdges: (edges: Edge[]) => void
    removeEdges: (sourceNodeId:string, targetNodeId:string) => void
    upsertEdge: (edge:Edge) => void
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    mergeNodes: (nodes) => {
        console.log(nodes)
        set({
            nodes: [...get().nodes, ...nodes]
        })
    },
    updateNode: (node) => {
        set({
            nodes: get().nodes.map((n) => {
                if (n.id === node.id) return node
                return n
            })
        })
    },
    initNodes: (nodes) => {
        set({
            nodes: [...nodes]
        })
    },
    deleteNode: (node) => {
        console.log(node)
        set({
            nodes: get().nodes.filter((n) => n.id !== node.id)
        })
    },
    initEdges: (edges: Edge[]) => {
        set({
            edges: [...edges],
        })
    },
    // addEdge: (edge: Edge) => {
    //     set({
    //         edges: addEdge({...edge}, get().edges),
    //     });
    // },
    removeEdges: (sourceNodeId:string, targetNodeId:string) => {
        set({
            edges: get().edges.filter(e => e.source !== sourceNodeId || e.target !== targetNodeId)
        })
    },
    upsertEdge: (edge: Edge) => {
        set({
            edges: addEdge({...edge}, get().edges.filter(e => e.id !== edge.id))
        })
    }

}));
export const FlowsSlice = createSlice({
    name: "Flows",
    initialState: FlowsInitialState,
    reducers: {
        create: (state, action: PayloadAction<Flow[]>) => {
            state.flows = action.payload
        },
        push: (state, action: PayloadAction<Flow>) => {
            state.flows.push(action.payload)
        },
        remove: (state, action: PayloadAction<Flow>) => {
            state.flows = state.flows.filter((t) => {
                return t.name !== action.payload.name
            })
        },
        update: (state, action: PayloadAction<Flow>) => {
            state.flows = state.flows.map((t) => {
                if (t.name === action.payload.name) {
                    return action.payload
                } else {
                    return t
                }
            })
        },
        clear: (state) => {
            state.flows = []
        }
    }
})
export const SelectedFlowSlice = createSlice({
    name: "SelectedFlow",
    initialState: selectedFlowInitialState,
    reducers: {
        select: (state, action: PayloadAction<Flow | null>) => {
            state.flow = action.payload
        },
    }
})
export const NodeEditDrawerSlice = createSlice({
    name: "NodeEditDrawer",
    initialState: NodeEditDrawerInitialState,
    reducers: {
        open: (state) => {
            state.opened = true
        },
        close: (state) => {
            state.opened = false
        }
    }
})
export const SelectedNodeSlice = createSlice({
    name: "SelectedNode",
    initialState: SelectedNodeInitialState,
    reducers: {
        select: (state, action: PayloadAction<Node | null>) => {
            state.node = action.payload
        },
    }
})
export const EditIODialogSlice = createSlice({
    name: "EditIODialog",
    initialState: EditIODialogInitialState,
    reducers: {
        open: (state, action: PayloadAction<"Parameters" | "Outputs">) => {
            state.opened = true
            state.type = action.payload
        },
        close: (state) => {
            state.opened = false
            state.type = null
        }
    }
})

// export const EditParameterSourceDialogSlice = createSlice({
//     name: "EditParameterSourceDialog",
//     initialState: EditParameterSourceDialogInitialState,
//     reducers: {
//         open: (state) => {
//             state.opened = true
//         },
//         close: (state) => {
//             state.opened = false
//         }
//     }
// })
// export const EditOutputTargetDialogSlice = createSlice({
//     name: "EditOutputTargetDialog",
//     initialState: EditOutputTargetDialogInitialState,
//     reducers: {
//         open: (state) => {
//             state.opened = true
//         },
//         close: (state) => {
//             state.opened = false
//         }
//     }
// })
export const ParameterRowSelectionModelSlice = createSlice({
    name: "ParameterRowSelectionModel",
    initialState: ParameterRowSelectionModelInitialState,
    reducers: {
        set: (state, action: PayloadAction<GridRowId[]>) => {
            state.rowIds = action.payload
        }
    }
})
export const OutputRowSelectionModelSlice = createSlice({
    name: "OutputRowSelectionModel",
    initialState: OutputRowSelectionModelInitialState,
    reducers: {
        set: (state, action: PayloadAction<GridRowId[]>) => {
            state.rowIds = action.payload
        }
    }
})
export const ReactFlowInstanceSlice = createSlice({
    name: "ReactFlowInstance",
    initialState: ReactFlowInstanceInitialState,
    reducers: {
        set: (state, action: PayloadAction<ReactFlowInstance | null>) => {
            state.reactFlowInstance = action.payload
        }
    }
})
export const { select: selectFlow } = SelectedFlowSlice.actions
export const {
    create: createFlows, push: pushFlow, remove: removeFlow,
    update: updateFlow, clear: clearFlows,
} = FlowsSlice.actions
export const { open: openNodeEditDrawe, close: closeNodeEditDrawe } = NodeEditDrawerSlice.actions
export const { select: selectNode } = SelectedNodeSlice.actions
export const { open: openEditIODialog, close: closeEditIODialog } = EditIODialogSlice.actions
// export const { open: openEditParameterSourceDialog, close: closeEditParameterSourceDialog } = EditParameterSourceDialogSlice.actions
// export const { open: openEditOutputTargetDialog, close: closeEditOutputTargetDialog } = EditOutputTargetDialogSlice.actions
export const { set: setParameterRowSelectionModel } = ParameterRowSelectionModelSlice.actions
export const { set: setOutputRowSelectionModel } = OutputRowSelectionModelSlice.actions
export const { set: setReactFlowInstance } = ReactFlowInstanceSlice.actions

// export const {create: createNodes, update: updateNode} = NodesSlice.actions
export const SelectFlowReducer = SelectedFlowSlice.reducer
export const FlowsReducer = FlowsSlice.reducer
export const NodeEditDrawerReducer = NodeEditDrawerSlice.reducer
export const SelectNodeReducer = SelectedNodeSlice.reducer
export const EditIODialogReducer = EditIODialogSlice.reducer
// export const EditParameterSourceDialogReducer = EditParameterSourceDialogSlice.reducer
// export const EditOutputTargetDialogReducer = EditOutputTargetDialogSlice.reducer
export const ParameterRowSelectionModelReducer = ParameterRowSelectionModelSlice.reducer
export const OutputRowSelectionModelReducer = OutputRowSelectionModelSlice.reducer
export const ReactFlowInstanceReducer = ReactFlowInstanceSlice.reducer

// export const NodesReducer = NodesSlice.reducer

export const selectSelectedFlow = (state: RootState) => state.selectedFlow.flow
export const selectFlows = (state: RootState) => state.flows.flows
export const selectNodeEditDrawer = (state: RootState) => state.nodeEditDrawer.opened
export const selectSelectedNode = (state: RootState) => state.selectedNode.node
export const selectEditIODialog = (state: RootState) => state.editIODialog
// export const selectEditParameterSourceDialog = (state: RootState) => state.editParameterSourceDialog.opened
// export const selectEditOutputTargetDialog = (state: RootState) => state.editOutputTargetDialog.opened
export const selectParameterRowSelectionModel = (state: RootState) => state.parametersRowSelectionModel.rowIds
export const selectOutputRowSelectionModel = (state: RootState) => state.outputRowSelectionModel.rowIds
export const selectReactFlowInstance = (state: RootState) => state.reactFlowInstance.reactFlowInstance
// export const selectNodes = (state: RootState) => state.nodes.nodes

export const selector = (state: RFState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    mergeNodes: state.mergeNodes,
    updateNode: state.updateNode,
    deleteNode: state.deleteNode,
    initNodes: state.initNodes,
    // addEdge: state.addEdge,
    initEdges: state.initEdges,
    removeEdges: state.removeEdges,
    upsertEdge: state.upsertEdge,

});