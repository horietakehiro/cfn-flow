
type UploadObjResponse = {
    httpUrl: string
    key: string
}
type TemplateSummarySection = "Parameters" | "Resources" | "Outputs"
type Template = {
    name: string,
    description: string | null,
    httpUrl: string,
    s3Url: string,
    createAt: string,
    updateAt: string,
}
type PutTemplateRequest = {
    name: string | null,
    description: string | null,
    httpUrl: string | null,
}
type PutTemplateResponse = {
    error: string | null
    template: Template | null
}
type GetTemplatesResponse = {
    error: string | null
    templates: Template[] | null
    nextToken: string | null
}
type DeleteTemplateResponse = {
    error: string | null
    templateName: string | null
}
type GetTemplateResponse = {
    error: string | null
    template: Template | null
}

type ParameterSummary = {
    name: String
    type: String
    description: string | null
    default: String | null
    noEcho: string | null
    minValue: Number | null
    maxValue: Number | null
    minLength: Number | null
    maxLength: Number | null
    allowedPattern: string | null
    allowedValues: []
    constraintDescription: string | null
}
type ResourceSummary = {
    name: string
    type: string
}
type OutputSummary = {
    name: string
    value: string
    description: string | null
    exportName: string | null
}
type TemplateSummary = {
    templateName: string
    sectionName: string
    summary: ParameterSummary[] | ResourceSummary[] | OutputSummary[]
}
type GetTemplateSummaryResponse = {
    error: string | null
    templateSummary: TemplateSummary
}


type Flow = {
    name: string,
    description: string | null,
    createAt: string,
    updateAt: string,
    httpUrl: string,
    s3Url: string,
}
type Alert = {
    opened: boolean
    message: string | null
    persist: number | null
    severity: "success" | "error"
}

type PutFlowRequest = {
    name: string | null,
    description: string | null,
    httpUrl: string | null,
}
type PutFlowResponse = {
    error: string | null
    flow: Flow | null
}
type GetFlowsResponse = {
    error: string | null
    flows: Flow[] | null
    nextToken: string | null
}
type DeleteFlowResponse = {
    error: string | null
    flowName: string | null
}
type GetFlowResponse = {
    error: string | null
    flow: Flow | null
}

type Stack = {
    stackName: string
    regionName: string
}
type GetStacksResponse = {
    error: string | null
    stacks: Stack[] | null
}
type PostStackTemplateResponse = {
    error: string | null
    httpUrl: string | null
}

type NodeType = "stackNode" | "StackSetNode"
// type Node = import("reactflow").Node
type BaseCUstomNodeData = {
    nodeName: string
    toolbarVisible: boolean
    nodeDeletable: boolean
}

type StartNodeData = BaseCUstomNodeData & {}
type StartNode = import("reactflow").Node<StartNodeData>
type StackNodeParameter = ParameterSummary & {
    visible: boolean
    src: {
        node: StackNode,
        output: OutputSummary
    }[]
    selected: boolean

}
type StackNodeData = BaseCUstomNodeData & {
    regionName: string
    templateName: string
    parameters: StackNodeParameter[] 
    outputs: (OutputSummary&{ visible: boolean })[]
}
type StackNode = import("reactflow").Node<StackNodeData>
