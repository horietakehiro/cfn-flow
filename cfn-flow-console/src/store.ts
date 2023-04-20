import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { AlertReducer } from "./stores/common";
import {
    EditOutputTargetDialogReducer,
    EditParameterSourceDialogReducer, FlowsReducer, NodeEditDrawerReducer,
    OutputRowSelectionModelReducer,
    ParameterRowSelectionModelReducer,
    ReactFlowInstanceReducer,
    SelectFlowReducer, SelectNodeReducer
} from "./stores/flows/main";
import leftDrawerReducer from "./stores/main";
import { CreateTemplateDialogReducer, DeleteTemplateDialogReducer, EditTemplateDialogReducer } from "./stores/templates/common";
import { SelectTemplateReducer, TemplatesReducer } from "./stores/templates/main";

const reducers = combineReducers({
    leftDrawer: leftDrawerReducer,
    selectedTemplate: SelectTemplateReducer,
    templates: TemplatesReducer,
    createTemplateDialog: CreateTemplateDialogReducer,
    editTemplateDialog: EditTemplateDialogReducer,
    deleteTemplateDialog: DeleteTemplateDialogReducer,
    selectedFlow: SelectFlowReducer,
    flows: FlowsReducer,
    alert: AlertReducer,
    nodeEditDrawer: NodeEditDrawerReducer,
    selectedNode: SelectNodeReducer,
    editParameterSourceDialog: EditParameterSourceDialogReducer,
    editOutputTargetDialog: EditOutputTargetDialogReducer,
    parametersRowSelectionModel: ParameterRowSelectionModelReducer,
    outputRowSelectionModel: OutputRowSelectionModelReducer,
    reactFlowInstance: ReactFlowInstanceReducer,
    // nodes: NodesReducer,
})

const persistConfig = {
    key: "root",
    storage: storage,
    blacklist: [
        "templates",
        "flows",
        "createTemplateDialog",
        "editTemplateDialog",
        "deleteTemplateDialog",
        "alert",
        "nodeEditDrawer",
        "selectedNode",
        "editParameterSourceDialog",
        "parametersRowSelectionModel",
        "reactFlowInstance"
    ]
    // black
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>