import { API } from "aws-amplify";
import { getApiAuth } from "../common";

const apiName = "FlowsApi"

export const getFlows = async ():Promise<GetFlowsResponse> => {
    const path = '/flows';
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    const response:GetFlowsResponse = await API.get(apiName, path, init)
    return response
}

export const putFlow = async (newFlow:PutFlowRequest):Promise<PutFlowResponse> => {
    const path = `/flows/${newFlow.name}`
    const init = {
      body: newFlow,
      headers: {
        Authorization: await getApiAuth()
      }
    }
    const response:PutFlowResponse = await API.put(apiName, path, init)
    return response
}

export const deleteFlow = async (flowName:string):Promise<DeleteFlowResponse> => {
    const path = `/flows/${flowName}`
    const init = {
      headers: {
        Authorization: await getApiAuth()
      }
    }
    const response:DeleteFlowResponse = await API.del(apiName, path, init)
    return response
} 

