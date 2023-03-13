import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface LeftDrawerState {
    opened: boolean
}
const initialState: LeftDrawerState = {
    opened: true
}

export const LeftDrawerSlice = createSlice({
    name: "leftDrawer",
    initialState,
    reducers: {
        invert: (state) => {
            state.opened = !state.opened
        }
    }
})


export const {invert} = LeftDrawerSlice.actions
export const selectLeftDrawer = (state: RootState) => state.leftDrawer.opened

export default LeftDrawerSlice.reducer