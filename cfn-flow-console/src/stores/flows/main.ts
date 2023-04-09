import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Node } from 'reactflow';
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
export const {select: selectFlow} = SelectedFlowSlice.actions
export const {
    create: createFlows, push: pushFlow, remove: removeFlow,
    update: updateFlow, clear: clearFlows,
} = FlowsSlice.actions
export const {open: openNodeEditDrawe, close: closeNodeEditDrawe} = NodeEditDrawerSlice.actions
export const {select: selectNode} = SelectedNodeSlice.actions

export const SelectFlowReducer = SelectedFlowSlice.reducer
export const FlowsReducer = FlowsSlice.reducer
export const NodeEditDrawerReducer = NodeEditDrawerSlice.reducer
export const SelectNodeReducer = SelectedNodeSlice.reducer

export const selectSelectedFlow = (state: RootState) => state.selectedFlow.flow
export const selectFlows = (state: RootState) => state.flows.flows
export const selectNodeEditDrawer = (state:RootState) => state.nodeEditDrawer.opened
export const selectSelectedNode = (state: RootState) => state.selectedNode.node