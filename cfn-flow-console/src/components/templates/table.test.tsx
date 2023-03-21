/**
 * @jest-environment jsdom
*/

import React from "react";
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux"
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from "../../store"
import {
  TemplatesTable
} from "./table"
import * as common from "./common"
import {
  createTemplates,selectTemplate
} from "../../stores/templates/main"

import { Amplify, API, Auth, Storage } from "aws-amplify";
import AmplifyConfig from './../../AmplifyConfig';

Amplify.configure(AmplifyConfig);


let persistor = persistStore(store)

describe("templates table", () => {
  var WrappedTemplatesTable = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <TemplatesTable />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
  it("render templates table on page loaded", async () => {

    jest.spyOn(common, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "get").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          templates: [
            {
              name: "template-1",
              description: "description 1",
              httpUrl: "https://example.com/template-1.json",
              s3Url: "s3://example.com/template-1.json",
              createAt: "2023-10-10T00:00:00+0900",
              updateAt: "-"
            },
            {
              name: "template-2",
              description: "description 2",
              httpUrl: "https://example.com/template-2.json",
              s3Url: "s3://example.com/template-2.json",
              createAt: "2023-10-10T00:00:00+0900",
              updateAt: "-"
            }
          ]
        }
      )
    )

    await act(async () => {
      store.dispatch(createTemplates([]))
      render(WrappedTemplatesTable)
    })
    expect(store.getState().templates.templates.length).toBe(2)
    expect(screen.getAllByRole("row").length).toBe(2+1)
  })

  it("allow to push create template button", async () => {

    jest.spyOn(common, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "get").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          templates: []
        }
      )
    )
    await act(async () => {
      store.dispatch(createTemplates([]))
      render(WrappedTemplatesTable)
    })
    expect(store.getState().templates.templates.length).toBe(0)
    expect(screen.getAllByRole("row").length).toBe(1)
    
    await act(async () => {
      userEvent.click(screen.getByTestId("create-button"))
    })
    expect(store.getState().createTemplateDialog.opened).toBe(true)
    expect(screen.getByRole("dialog")).toHaveTextContent("New")

    await act(async () => {
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    expect(store.getState().createTemplateDialog.opened).toBe(false)
  })


  it("allow to push edit template button if a template selected", async () => {

    jest.spyOn(common, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "get").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          templates: [
            {
              name: "template-1",
              description: "description 1",
              httpUrl: "https://example.com/template-1.json",
              s3Url: "s3://example.com/template-1.json",
              createAt: "2023-10-10T00:00:00+0900",
              updateAt: "-"
            },
          ]
        }
      )
    )
    await act(async () => {
      store.dispatch(createTemplates([]))
      render(WrappedTemplatesTable)
    })
    expect(store.getState().templates.templates.length).toBe(1)
    expect(screen.getAllByRole("row").length).toBe(2)
    
    // await act(async () => {
    //   userEvent.click(screen.getByTestId("edit-button"))
    // })
    expect(() => userEvent.click(screen.getByTestId("edit-button"))).toThrow()
    expect(store.getState().editTemplateDialog.opened).toBe(false)

    await act(async () => {
      userEvent.click(screen.getAllByRole("row")[1])
    })
    expect(store.getState().selectedTemplate.template).not.toBeNull()
    await act(async () => {
      userEvent.click(screen.getByTestId("edit-button"))
    })
    expect(store.getState().editTemplateDialog.opened).toBe(true)
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit")

    await act(async () => {
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    expect(store.getState().editTemplateDialog.opened).toBe(false)
  })


  it("allow to push delete template button if a template selected", async () => {

    jest.spyOn(common, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "get").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          templates: [
            {
              name: "template-1",
              description: "description 1",
              httpUrl: "https://example.com/template-1.json",
              s3Url: "s3://example.com/template-1.json",
              createAt: "2023-10-10T00:00:00+0900",
              updateAt: "-"
            },
          ]
        }
      )
    )
    await act(async () => {
      store.dispatch(createTemplates([]))
      render(WrappedTemplatesTable)
    })
    expect(store.getState().templates.templates.length).toBe(1)
    expect(screen.getAllByRole("row").length).toBe(2)
    
    // await act(async () => {
    //   userEvent.click(screen.getByTestId("edit-button"))
    // })
    expect(() => userEvent.click(screen.getByTestId("delete-button"))).toThrow()
    expect(store.getState().deleteTemplateDialog.opened).toBe(false)

    await act(async () => {
      userEvent.click(screen.getAllByRole("row")[1])
    })
    expect(store.getState().selectedTemplate.template).not.toBeNull()
    await act(async () => {
      userEvent.click(screen.getByTestId("delete-button"))
    })
    expect(store.getState().deleteTemplateDialog.opened).toBe(true)
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete")

    await act(async () => {
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    expect(store.getState().deleteTemplateDialog.opened).toBe(false)
  })


  it("allow to push refresh button and refresh templates", async () => {

    jest.spyOn(common, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "get").mockReturnValueOnce(
      Promise.resolve(
        {
          error: null,
          templates: []
        }
      )
    ).mockReturnValueOnce(
      Promise.resolve({
        error: null,
        templates: [
          {
            name: "template-1",
            description: "description 1",
            httpUrl: "https://example.com/template-1.json",
            s3Url: "s3://example.com/template-1.json",
            createAt: "2023-10-10T00:00:00+0900",
            updateAt: "-"
          },
        ]
      })
    )
    await act(async () => {
      store.dispatch(createTemplates([]))
      render(WrappedTemplatesTable)
    })
    expect(store.getState().templates.templates.length).toBe(0)
    expect(screen.getAllByRole("row").length).toBe(1)

    await act(async () => {
      userEvent.click(screen.getByTestId("refresh-button"))
    })
    expect(store.getState().templates.templates.length).toBe(1)
    expect(screen.getAllByRole("row").length).toBe(2)

  })

})

