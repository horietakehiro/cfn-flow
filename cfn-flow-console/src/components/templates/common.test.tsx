/**
 * @jest-environment jsdom
*/

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from "../../store";
import * as apiCommon from "./../../apis/common";
import * as common from "./common";
import { CreateTemplateDialog, DeleteTemplateDialog, EditTemplateDialog } from "./common";

import {
  createDialogOpen, deleteDialogOpen, editDialogOpen
} from '../../stores/templates/common';
import {
  pushTemplate,
  selectTemplate
} from "../../stores/templates/main";

import { Amplify, API, Storage } from "aws-amplify";
import AmplifyConfig from './../../AmplifyConfig';

Amplify.configure(AmplifyConfig);


let persistor = persistStore(store)

describe("create template dialog", () => {
  var WrappedCreateDialog = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <CreateTemplateDialog />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
  it("create new template on create dialog", async () => {
    jest.spyOn(apiCommon, "getApiAuth").mockReturnValue(
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
      render(WrappedCreateDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("New")

    await act(async () => {
      // enter new template props and submit
      userEvent.type(screen.getByTestId("template-name"), "test-template")
      userEvent.type(screen.getByTestId("description"), "test description")
      userEvent.click(screen.getByTestId("amazon-s3-url"))
      userEvent.type(screen.getByTestId("template-url"), "https://example.com/test-template.json")
    })
    await act(async () => {
      userEvent.click(screen.getByTestId("create-button"))
    })

    expect(store.getState().createTemplateDialog.opened).toBe(false)
    expect(
      store.getState().templates.templates.filter((t) => {
        return t.name === "test-template"
      }).length
    ).toBe(1)

  })

  it("allows upload local file and create new template with it", async () => {

    jest.spyOn(apiCommon, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "put").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          template: {
            name: "local-template",
            description: "test description",
            httpUrl: `https://${AmplifyConfig.aws_user_files_s3_bucket}.s3.${AmplifyConfig.aws_user_files_s3_bucket_region}.amazonaws.com/public/local-template.json`,
            s3Url: `s3://${AmplifyConfig.aws_user_files_s3_bucket}/test-template.json`,
            createAt: "2023-10-10T00:00:00+0900",
            updateAt: "-"
          }
        }
      )
    )
    jest.spyOn(Storage, "put").mockReturnValue(
      Promise.resolve({
        "key": "local-template.json"
      })
    )

    act(() => {
      store.dispatch(createDialogOpen())
      render(WrappedCreateDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("New")

    await act(async () => {
      // enter new template props and submit
      userEvent.type(screen.getByTestId("template-name"), "local-template")
      userEvent.type(screen.getByTestId("description"), "test description")
      userEvent.click(screen.getByTestId("upload-local-file"))
      const file = new File(['{"key": "value"}'], 'local-template.json.', { type: 'application/json' })
      userEvent.upload(screen.getByTestId("upload-button"), file)
      userEvent.click(screen.getByTestId("create-button"))
    })
    await waitFor(() => expect(screen.getByTestId("template-name")).not.toBe(""))
    await act(async () => {
      userEvent.click(screen.getByTestId("create-button"))
    })

    expect(store.getState().createTemplateDialog.opened).toBe(false)
    expect(
      store.getState().templates.templates.filter((t) => {
        return t.name === "local-template"
      }).length
    ).toBe(1)

  })


  it("can cancel to create new template", async () => {

    await act(async () => {
      store.dispatch(createDialogOpen())
      render(WrappedCreateDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("New")

    await act(async () => {
      // enter new template props and submit
      userEvent.type(screen.getByTestId("template-name"), "cancel-template")
      userEvent.type(screen.getByTestId("description"), "test description")
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    const states = store.getState()
    expect(states.createTemplateDialog.opened).toBe(false)

    await act(async () => {
      store.dispatch(createDialogOpen())
    })
    expect(screen.getByTestId("template-name")).not.toHaveTextContent("cancel-template")

  })

})


describe("edit template dialog", () => {
  var WrappeedEditDialog = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <EditTemplateDialog />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
  it("update existing template", async () => {

    jest.spyOn(apiCommon, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "put").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          template: {
            name: "existing-template",
            description: "update description",
            httpUrl: "https://example.com/test-template.json",
            s3Url: "s3://example.com/test-template.json",
            createAt: "2023-10-10T00:00:00+0900",
            updateAt: "2023-10-10T00:00:00+0900"
          }
        }
      )
    )
    await act(async () => {
      const existingTemplate:Template = {
        name: "existing-template",
        description: "existing description",
        httpUrl: "https://example.com/test-template.json",
        s3Url: "s3://example.com/test-template.json",
        createAt: "2023-10-10T00:00:00+0900",
        updateAt: "2023-10-10T00:00:00+0900"
      }
      store.dispatch(pushTemplate(existingTemplate))
      store.dispatch(selectTemplate(existingTemplate))
      store.dispatch(editDialogOpen())
      render(WrappeedEditDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit")

    await act(async () => {
      userEvent.type(screen.getByTestId("description"), "update description")
      userEvent.click(screen.getByTestId("edit-button"))
    })
    expect(store.getState().editTemplateDialog.opened).toBe(false)
    expect(
      store.getState().templates.templates.filter((t) => {
        return t.description === "update description"
      }).length
    ).toBe(1)
  })

  it("affect no change if edit canceled", async () => {
    await act(async () => {
      store.dispatch(selectTemplate({
        name: "existing-template",
        description: "existing description",
        httpUrl: "https://example.com/test-template.json",
        s3Url: "s3://example.com/test-template.json",
        createAt: "2023-10-10T00:00:00+0900",
        updateAt: "2023-10-10T00:00:00+0900"
      }))
      store.dispatch(editDialogOpen())
      render(WrappeedEditDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit")

    await act(async () => {
      // enter new template props and submit
      userEvent.type(screen.getByTestId("description"), "cancel description")
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    const states = store.getState()
    expect(states.editTemplateDialog.opened).toBe(false)
    expect(
      states.templates.templates.filter((t) => {
        return t.description === "cancel description"
      }).length
    ).toBe(0)
  })

})




describe("delete template dialog", () => {
  var WrappeedDeleteDialog = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <DeleteTemplateDialog />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
  it("delete existing template", async () => {

    jest.spyOn(apiCommon, "getApiAuth").mockReturnValue(
      Promise.resolve("dummytoken")
    )
    jest.spyOn(API, "del").mockReturnValue(
      Promise.resolve(
        {
          error: null,
          templateName: "deleting-template"
        }
      )
    )
    await act(async () => {
      const existingTemplate:Template = {
        name: "deleting-template",
        description: "deleting description",
        httpUrl: "https://example.com/test-template.json",
        s3Url: "s3://example.com/test-template.json",
        createAt: "2023-10-10T00:00:00+0900",
        updateAt: "2023-10-10T00:00:00+0900"
      }
      store.dispatch(pushTemplate(existingTemplate))
      store.dispatch(selectTemplate(existingTemplate))
      store.dispatch(deleteDialogOpen())
      render(WrappeedDeleteDialog)
    })
    store.dispatch(deleteDialogOpen())
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete")

    await act(async () => {
      userEvent.click(screen.getByTestId("delete-button"))
    })
    expect(store.getState().deleteTemplateDialog.opened).toBe(false)
    expect(
      store.getState().templates.templates.filter((t) => {
        return t.name === "deleting-template"
      }).length
    ).toBe(0)
  })

  it("affect no change if delete canceled", async () => {
    await act(async () => {
      const existingTemplate:Template = {
        name: "deleting-template",
        description: "deleting description",
        httpUrl: "https://example.com/test-template.json",
        s3Url: "s3://example.com/test-template.json",
        createAt: "2023-10-10T00:00:00+0900",
        updateAt: "2023-10-10T00:00:00+0900"
      }
      store.dispatch(pushTemplate(existingTemplate))
      store.dispatch(selectTemplate(existingTemplate))
      store.dispatch(deleteDialogOpen())
      render(WrappeedDeleteDialog)
    })
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete")

    await act(async () => {
      userEvent.click(screen.getByTestId("cancel-button"))
    })
    const states = store.getState()
    expect(states.deleteTemplateDialog.opened).toBe(false)
    expect(
      states.templates.templates.filter((t) => {
        return t.name === "deleting-template"
      }).length
    ).toBe(1)
  })

})

describe("validateTemplateRequest", () => {
  it("return true if request is valid", () => {
    const req:PutTemplateRequest = {
      name: "some-template", httpUrl: "https://example.com", description: ""
    }
    const {isValid, errors} = common.validatePutTemplateRequest(req)
    expect(isValid).toBe(true)
    expect(errors.name).toBeNull()
    expect(errors.httpUrl).toBeNull()
  })

  it("return false if request is invalid", () => {
    const req:PutTemplateRequest = {
      name: "", httpUrl: "", description: "some description"
    }
    const {isValid, errors} = common.validatePutTemplateRequest(req)
    expect(isValid).toBe(false)
    expect(errors.name).not.toBeNull()
    expect(errors.httpUrl).not.toBeNull()
  }) 
}) 