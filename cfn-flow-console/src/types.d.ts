// type Template = {
//     id: string,
//     name: string,
//     description: string,
//     createAt: string,
//     updateAt: string,
//     httpUrl: string,
//     s3Url: string,
// }

type Template = {
    name: string,
    description: string | null,
    httpUrl: string,
    s3Url: string,
    createAt: string,
    updateAt: string,
}
type PutTemplateRequest = {
    name: string,
    description: string | null,
    httpUrl: string,
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