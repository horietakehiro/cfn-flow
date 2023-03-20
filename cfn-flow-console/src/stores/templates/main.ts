import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface TemplatesState {
    templates: Template[]
}
export interface SelectedTemplateState {
    template: Template | null
}
const TemplatesInitialState: TemplatesState = {
    templates: []
}
const selectedTemplateInitialState: SelectedTemplateState = {
    template: null
}

export const TemplatesSlice = createSlice({
    name: "Templates",
    initialState: TemplatesInitialState,
    reducers: {
        create: (state, action: PayloadAction<Template[]>)  => {
            state.templates = action.payload
        },
        push: (state, action: PayloadAction<Template>)  => {
            state.templates.push(action.payload)
        },
        remove: (state, action: PayloadAction<Template>)  => {
            state.templates = state.templates.filter((t) => {
                return t.name !== action.payload.name
            })
        },
        update: (state, action: PayloadAction<Template>) => {
            state.templates = state.templates.map((t) => {
                if (t.name === action.payload.name) {
                    return action.payload
                } else {
                    return t
                }
            })
        },
        clear: (state) => {
            state.templates = []
        }
    }
})
export const SelectedTemplateSlice = createSlice({
    name: "SelectedTemplate",
    initialState: selectedTemplateInitialState,
    reducers: {
        select: (state, action: PayloadAction<Template | null>) => {
            state.template = action.payload
        }
    }
})
export const {select: selectTemplate} = SelectedTemplateSlice.actions
export const {
    create: createTemplates, push: pushTemplate, remove: removeTemplate,
    update: updateTemplate, clear: clearTemplates,
} = TemplatesSlice.actions
export const selectSelectedTemplate = (state: RootState) => state.selectedTemplate.template
export const selectTemplates = (state: RootState) => state.templates.templates
export const SelectTemplateReducer = SelectedTemplateSlice.reducer
export const TemplatesReducer = TemplatesSlice.reducer
