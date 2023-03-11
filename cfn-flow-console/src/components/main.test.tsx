/**
 * @jest-environment jsdom
*/

import React from "react";
import { render, unmountComponentAtNode, } from "react-dom";
import { act } from "react-dom/test-utils";

import { BrowserRouter } from "react-router-dom";

import MainOutline from "./main";

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
        render(<BrowserRouter><MainOutline/></BrowserRouter>, container)
    })
    expect(container?.textContent).toContain("Hello")
})

