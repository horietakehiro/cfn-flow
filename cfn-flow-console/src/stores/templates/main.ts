import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface SelectedTemplateState {
    template: Template | null
}
const initialState: SelectedTemplateState = {
    template: null
}

export const SelectedTemplateSlice = createSlice({
    name: "SelectedTemplate",
    initialState,
    reducers: {
        select: (state, action: PayloadAction<Template>) => {
            state.template = action.payload
        }
    }
})


export const {select} = SelectedTemplateSlice.actions
export const selectSelectedTemplate = (state: RootState) => state.selectedTemplate.template

export default SelectedTemplateSlice.reducer