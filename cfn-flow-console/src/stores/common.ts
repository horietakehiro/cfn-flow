import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";


export interface AlertState {
    alert: Alert
}
const AlertInitialState: AlertState = {
    alert: {
        opened: false,
        message: null,
        persist: 5000,
        severity: "success",
    }
}
export const AlertSlice = createSlice({
    name: "Alert",
    initialState: AlertInitialState,
    reducers: {
        set: (state, action: PayloadAction<Alert>) => {
            state.alert = action.payload
        }
    }
})

export const {set: setAlert} = AlertSlice.actions
export const selectAlert = (state: RootState) => state.alert.alert
export const AlertReducer = AlertSlice.reducer