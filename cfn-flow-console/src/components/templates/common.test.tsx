/**
 * @jest-environment jsdom
*/

// import {describe, expect, test} from '@jest/globals';
import React from "react";
import '@testing-library/jest-dom'
import { rest } from "msw"
import { setupServer } from 'msw/node'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
// import { render, unmountComponentAtNode, } from "react-dom";

import { BrowserRouter } from "react-router-dom";

import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

import { Provider } from "react-redux"
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from "../../store"

import { getApiAuth, CreateTemplateDialog } from "./common"
import * as common from "./common"

import {
  createDialogOpen, createDialogClose, selectCreateDialog,
} from '../../stores/templates/common';

import { Amplify, API, Auth } from "aws-amplify";
import AmplifyConfig from './../../AmplifyConfig';

// Amplify.configure(awsExports);
Amplify.configure(AmplifyConfig);


const server = setupServer(
  rest.put('/templates/:templateName', async (req, res, ctx) => {
    try {
      const reqBody:PutTemplateRequest = await req.json()
      console.log(reqBody)
      const template: PutTemplateResponse = {
        error: null,
        template: {
          name: reqBody.name,
          description: reqBody.description,
          httpUrl: reqBody.httpUrl,
          s3Url: "s3://example.com/test-template.json",
          createAt: "2023-10-10T00:00:00+0900",
          updateAt: "-"
        }
      }
      return res(ctx.json(template))
    } catch(e) {
      console.error(e)
    }

  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

let persistor = persistStore(store)


it("create new template resource via create dialog", async () => {
  var WrappedComponent = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <CreateTemplateDialog/>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )

  jest.spyOn(common, "getApiAuth").mockReturnValue(
    Promise.resolve("dummytoken")
  )
  jest.spyOn(API, "put").mockReturnValue(
    
    Promise.resolve(
      {
        error: null,
        template: {
          name: "test-template",
          description: "test description",
          httpUrl: "https://example.com/test-template.json",
          s3Url: "s3://example.com/test-template.json",
          createAt: "2023-10-10T00:00:00+0900",
          updateAt: "-"
        }
      }
    )
  )

  act(() => {
    store.dispatch(createDialogOpen())
    render(WrappedComponent)
  })
  expect(screen.getByRole("dialog")).toHaveTextContent("New")

  await act(async () => {
    // enter new template props and submit
    userEvent.type(screen.getByTestId("template-name"), "test-template")
    userEvent.type(screen.getByTestId("description"), "test description")
    userEvent.click(screen.getByTestId("amazon-s3-url"))
    userEvent.type(screen.getByTestId("template-url"), "https://example.com/test-template.json")    
    userEvent.click(screen.getByTestId("create-button"))
  })
  const states = store.getState()
  expect(states.createTemplateDialog.opened).toBe(false)
  expect(
    states.templates.templates.filter((t) => {
      return t.name === "test-template"
    }).length
  ).toBe(1)
  
})