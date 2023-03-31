import { API, Storage } from "aws-amplify";
import AmplifyConfig from "../../AmplifyConfig";
import { getApiAuth } from "../common";


const apiName = "TemplatesApi"

export const getTemplates = async (): Promise<GetTemplatesResponse> => {
    const path = "/templates"
    const init = {
        headers: {
            Authorization: await getApiAuth()
        }
    }
    const response: GetTemplatesResponse = await API.get(apiName, path, init)
    return response
}

export const getTemplate = async (templateName: string): Promise<GetTemplateResponse> => {
    const path = `/templates/${templateName}`
    const init = {
        headers: {
            Authorization: await getApiAuth()
        }
    }
    const response: GetTemplateResponse = await API.get(apiName, path, init)
    return response
}

export const getTemplateSummary = async (
    templateName: string,
    sectionName: TemplateSummarySection,
): Promise<GetTemplateSummaryResponse> => {
    const apiName = 'TemplatesApi';
    const path = `/templates/${templateName}/${sectionName}`;
    const init = {
        headers: {
            Authorization: await getApiAuth()
        }
    }
    const response: GetTemplateSummaryResponse = await API.get(apiName, path, init);
    return response
}

export const putTemplate = async (
    newTemplate: PutTemplateRequest,
): Promise<PutTemplateResponse> => {
    const path = `/templates/${newTemplate.name}`
    const init = {
        body: newTemplate,
        headers: {
            Authorization: await getApiAuth()
        }
    };
    const response: PutTemplateResponse = await API.put(apiName, path, init)
    return response
}
export const deleteTemplate = async (templateName:string):Promise<DeleteTemplateResponse> => {
    const path = `/templates/${templateName}`
    const myInit = {
      headers: {
        Authorization: await getApiAuth()
      }
    };
    const response: DeleteTemplateResponse = await API.del(apiName, path, myInit)
    return response

}