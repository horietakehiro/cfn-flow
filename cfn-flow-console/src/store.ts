import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import leftDrawerReducer from "./stores/main"
import selectedTemplateRuducer from "./stores/templates/main"
import {CreateTemplateDialogReducer, EditTemplateDialogReducer, DeleteTemplateDialogReducer} from "./stores/templates/common"

const reducers = combineReducers({
    leftDrawer: leftDrawerReducer,
    selectedTemplate: selectedTemplateRuducer,
    createTemplateDialog: CreateTemplateDialogReducer,
    editTemplateDialog: EditTemplateDialogReducer,
    deleteTemplateDialog: DeleteTemplateDialogReducer,
})

const persistConfig = {
    key: "root",
    storage: storage
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
    reducer: persistedReducer
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>