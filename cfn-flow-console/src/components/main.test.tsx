/**
 * @jest-environment jsdom
*/

import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
// import { render, unmountComponentAtNode, } from "react-dom";

import { BrowserRouter } from "react-router-dom";

import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import MainOutline from "./main";

import { Provider } from "react-redux";
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from "./../store";

let persistor = persistStore(store)

it("left drawer state is persistent", async () => {
  var WrappedComponent = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <MainOutline />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
  act(() => {
    render(WrappedComponent)
  })
  expect(screen.getByTestId("left-drawer-close-button")).toBeInTheDocument()
  act(() => {
    userEvent.click(screen.getByTestId("left-drawer-button"))
  })
  expect(await screen.findByTestId("left-drawer-open-button")).toBeInTheDocument()

  cleanup()
  
  act(() => {
    render(WrappedComponent)
  })
  expect(await screen.findByTestId("left-drawer-open-button")).toBeInTheDocument()
})