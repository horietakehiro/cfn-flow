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

