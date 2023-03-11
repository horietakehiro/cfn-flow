/**
 * @jest-environment jsdom
*/

import React from "react";
import { render, unmountComponentAtNode, } from "react-dom";
import { act } from "react-dom/test-utils";


import App from "./App";

var container:HTMLDivElement | null = null

beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
})

afterEach(() => {
    if (container) {
        unmountComponentAtNode(container)
        container.remove()
        container = null
    }
})

it("get home page", () => {
    act(() => {
        render(<App/>, container)
    })
    expect(container?.textContent).toContain("Hello")
})

