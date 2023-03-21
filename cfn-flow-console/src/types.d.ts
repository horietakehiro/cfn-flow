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

type Parameter = {
    Description?: string
    Type?: String
    Default?: String

}
type ParametersSummary = {
    [key: string]: Parameter
}
type ResourcesSummary = {}
type OutputsSummary = {}
type TemplateSummary = {
    templateName: string
    sectionName: string
    summary: ParametersSummary | ResourcesSummary | OutputsSummary
}
type GetTemplateSummaryResponse = {
    error: string | null
    templateSummary: TemplateSummary
}