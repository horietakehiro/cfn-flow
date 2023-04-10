import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, Node, NodeChange, OnConnect, OnEdgesChange, OnNodesChange } from 'reactflow';
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
}
export interface NodesState {
    nodes: Node[]
    onNodesChange: OnNodesChange
}

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
    opened: false
}
export type RFState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes:Node[]) => void,
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
    setNodes: (nodes) => {
        set({nodes: nodes})
    }
    
  }));
export const FlowsSlice = createSlice({
    name: "Flows",
    initialState: FlowsInitialState,
    reducers: {
        create: (state, action: PayloadAction<Flow[]>)  => {
            state.flows = action.payload
        },
        push: (state, action: PayloadAction<Flow>)  => {
            state.flows.push(action.payload)
        },
        remove: (state, action: PayloadAction<Flow>)  => {
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
        open: (state) => {
            state.opened = true
        },
        close: (state) => {
            state.opened = false
        }
    }
})
// export const NodesSlice = createSlice({
//     name: "Nodes",
//     initialState: NodesInitialState,
//     reducers: {
//         create: (state, action: PayloadAction<Node[]>) => {
//             state.nodes = action.payload
//         },
//         // push: (state, action: PayloadAction<Node>)  => {
//         //     state.flows.push(action.payload)
//         // },
//         // remove: (state, action: PayloadAction<Flow>)  => {
//         //     state.flows = state.flows.filter((t) => {
//         //         return t.name !== action.payload.name
//         //     })
//         // },
//         update: (state, action: PayloadAction<Node>) => {
//             state.nodes = state.nodes.map((n) => {
//                 if (n.id === action.payload.id) {
//                     return action.payload
//                 } else {
//                     return n
//                 }
//             })
//         },
//         clear: (state) => {
//             state.nodes = []
//         }
//     }
// })
export const {select: selectFlow} = SelectedFlowSlice.actions
export const {
    create: createFlows, push: pushFlow, remove: removeFlow,
    update: updateFlow, clear: clearFlows,
} = FlowsSlice.actions
export const {open: openNodeEditDrawe, close: closeNodeEditDrawe} = NodeEditDrawerSlice.actions
export const {select: selectNode} = SelectedNodeSlice.actions
export const {open: openEditIODialog, close: closeEditIODialog} = EditIODialogSlice.actions
// export const {create: createNodes, update: updateNode} = NodesSlice.actions
export const SelectFlowReducer = SelectedFlowSlice.reducer
export const FlowsReducer = FlowsSlice.reducer
export const NodeEditDrawerReducer = NodeEditDrawerSlice.reducer
export const SelectNodeReducer = SelectedNodeSlice.reducer
export const EditIODialogReducer = EditIODialogSlice.reducer
// export const NodesReducer = NodesSlice.reducer

export const selectSelectedFlow = (state: RootState) => state.selectedFlow.flow
export const selectFlows = (state: RootState) => state.flows.flows
export const selectNodeEditDrawer = (state:RootState) => state.nodeEditDrawer.opened
export const selectSelectedNode = (state: RootState) => state.selectedNode.node
export const selectEditIODialog = (state: RootState) => state.editIODialog.opened
// export const selectNodes = (state: RootState) => state.nodes.nodes