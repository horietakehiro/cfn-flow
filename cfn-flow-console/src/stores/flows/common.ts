import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface CreateDialogState {
    opened: boolean
}
const CreateDialogInitialState: CreateDialogState = {
    opened: false
}
export const CreateDialogSlice = createSlice({
    name: "CreateDialogState",
    initialState: CreateDialogInitialState,
    reducers: {
        createDialogOpen: (state) => {
            state.opened = true
        },
        createDialogClose: (state) => {
            state.opened = false
        }
    }
})
export const {createDialogOpen, createDialogClose} = CreateDialogSlice.actions
export const selectCreateDialog = (state: RootState) => state.createTemplateDialog.opened
export const CreateTemplateDialogReducer = CreateDialogSlice.reducer

export interface CreatePlanDialogState {
    opened: boolean
}
const CreatePlanDialogInitialState: CreatePlanDialogState = {
    opened: false
}
export const CreatePlanDialogSlice = createSlice({
    name: "CreatePlanDialogState",
    initialState: CreatePlanDialogInitialState,
    reducers: {
        createPlanDialogOpen: (state) => {
            state.opened = true
        },
        createPlanDialogClose: (state) => {
            state.opened = false
        }
    }
})
export const {createPlanDialogClose, createPlanDialogOpen} = CreatePlanDialogSlice.actions
export const selectCreatePlanDialog = (state: RootState) => state.createPlanDIalog.opened
export const CreatePlanDialogReducer = CreatePlanDialogSlice.reducer

export interface EditDialogState {
    opened: boolean
}
const EditDialogInitialState: EditDialogState = {
    opened: false
}

export const EditDialogSlice = createSlice({
    name: "EditDialogState",
    initialState: EditDialogInitialState,
    reducers: {
        editDialogOpen: (state) => {
            state.opened = true
        },
        editDialogClose: (state) => {
            state.opened = false
        }
    }
})
export const {editDialogOpen, editDialogClose} = EditDialogSlice.actions
export const selectEditDialog = (state: RootState) => state.editTemplateDialog.opened
export const EditTemplateDialogReducer = EditDialogSlice.reducer



export interface DeleteDialogState {
    opened: boolean
}
const DeleteDialogInitialState: DeleteDialogState = {
    opened: false
}
export const DeleteDialogSlice = createSlice({
    name: "DeleteDialogState",
    initialState: DeleteDialogInitialState,
    reducers: {
        deleteDialogOpen: (state) => {
            state.opened = true
        },
        deleteDialogClose: (state) => {
            state.opened = false
        }
    }
})
export const {deleteDialogOpen, deleteDialogClose} = DeleteDialogSlice.actions
export const selectDeleteDialog = (state: RootState) => state.deleteTemplateDialog.opened
export const DeleteTemplateDialogReducer = DeleteDialogSlice.reducer


export interface DeletePlanDialogState {
    opened: boolean
}
const DeletePlanDialogInitialState: DeletePlanDialogState = {
    opened: false
}
export const DeletePlanDialogSlice = createSlice({
    name: "DeletePlanDialogState",
    initialState: DeletePlanDialogInitialState,
    reducers: {
        deletePlanDialogOpen: (state) => {
            state.opened = true
        },
        deletePlanDialogClose: (state) => {
            state.opened = false
        }
    }
})
export const {deletePlanDialogOpen, deletePlanDialogClose} = DeletePlanDialogSlice.actions
export const selectPlanDeleteDialog = (state: RootState) => state.deletePlanDialog.opened
export const DeletePlanDialogReducer = DeletePlanDialogSlice.reducer
