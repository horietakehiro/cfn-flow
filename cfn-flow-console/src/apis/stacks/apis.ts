import { API } from "aws-amplify";
import { getApiAuth } from "../common";

const apiName = "StacksApi"

export const getStacks = async (regionName:string):Promise<GetStacksResponse> => {
    const path = `/stacks/${regionName}`;
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    const response:GetStacksResponse = await API.get(apiName, path, init)
    return response
}

export const postStackTemplate = async ({stackName, regionName}: Stack):Promise<PostStackTemplateResponse> => {
    const path = `/stacks/${regionName}/${stackName}`;
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    const response:PostStackTemplateResponse = await API.post(apiName, path, init)
    return response
}

