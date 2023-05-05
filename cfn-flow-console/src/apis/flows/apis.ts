import { API } from "aws-amplify";
import { getApiAuth } from "../common";

const apiName = "FlowsApi"

export const getPlans = async (flowName:string):Promise<GetPlansResponse> => {
  const path = `/flows/${flowName}/plans`
  const init = {
    headers: {
      Authorization: await getApiAuth()
    }
  }
  const response:GetPlansResponse = await API.get(apiName, path, init)
  return response
}

export const getFlow = async (flowName:string):Promise<GetFlowResponse> => {
  const path = `/flows/${flowName}`
  const init = {
    headers: {
      Authorization: await getApiAuth()
    }
  }
  const response:GetFlowResponse = await API.get(apiName, path, init)
  return response
}

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


export const putPlan = async (plan:PutPlanRequest):Promise<PutPlanResponse> => {
  const path = `/flows/${plan.flowName}/plans/${plan.planName}`
  const init = {
    body: plan,
    headers: {
      Authorization: await getApiAuth()
    }
  }
  const response:PutPlanResponse = await API.put(apiName, path, init)
  return response
}

export const deletePlan = async (flowName:string, planName:string):Promise<DeletePlanResponse> => {
  const path = `/flows/${flowName}/plans/${planName}`
  const init = {
    headers: {
      Authorization: await getApiAuth()
    }
  }
  const response:DeletePlanResponse = await API.del(apiName, path, init)
  return response
} 

