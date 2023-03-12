import { createSlice,PayloadAction } from "@reduxjs/toolkit";
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
        // open: (state) => {
        //     state.opened = true
        // },
        // close: (state) => {
        //     state.opened = false
        // }
        invert: (state) => {
            console.log(state.opened)
            state.opened = !state.opened
            console.log(state.opened)
        }
    }
})

export const {invert} = LeftDrawerSlice.actions
export const selectLeftDrawer = (state: RootState) => state.leftDrawer.opened

export default LeftDrawerSlice.reducer