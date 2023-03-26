import { configureStore, PreloadedState } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import leftDrawerReducer from "./stores/main"
import { SelectTemplateReducer, TemplatesReducer } from "./stores/templates/main"
import {CreateTemplateDialogReducer, EditTemplateDialogReducer, DeleteTemplateDialogReducer} from "./stores/templates/common"
import { SelectFlowReducer, FlowsReducer } from "./stores/flows/main"
import { AlertReducer } from "./stores/common"

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
})

const persistConfig = {
    key: "root",
    storage: storage,
    blacklist: [
        "templates",
        "createTemplateDialog",
        "editTemplateDialog",
        "deleteTemplateDialog",
        "alert"
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