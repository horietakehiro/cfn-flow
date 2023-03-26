import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface FlowsState {
    flows: Flow[]
}
export interface SelectedFlowState {
    flow: Flow | null
}
const FlowsInitialState: FlowsState = {
    flows: []
}
const selectedFlowInitialState: SelectedFlowState = {
    flow: null
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
export const {select: selectFlow} = SelectedFlowSlice.actions
export const {
    create: createFlows, push: pushFlow, remove: removeFlow,
    update: updateFlow, clear: clearFlows,
} = FlowsSlice.actions
export const selectSelectedFlow = (state: RootState) => state.selectedFlow.flow
export const selectFlows = (state: RootState) => state.flows.flows
export const SelectFlowReducer = SelectedFlowSlice.reducer
export const FlowsReducer = FlowsSlice.reducer
