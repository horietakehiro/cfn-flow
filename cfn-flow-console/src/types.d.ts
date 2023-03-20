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