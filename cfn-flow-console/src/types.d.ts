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

type TemplatesResponse = {
    error: string | null
    templates: Template[] | null
    nextToken: string | null
}
