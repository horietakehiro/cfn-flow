
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

type AvailabilityZonesResponse = {
    error: string | null
    availabilityZones: string[]
}
type InstanceDetail = {
    id: string
    name: string | null
}
type InstanceDetailsResponse = {
    error: string | null
    instanceDetails: InstanceDetail[]
}

type ParameterType = 
    "String" | "Number" | "List<Number>" | "CommaDelimitedList" |
    "AWS::EC2::AvailabilityZone::Name" | "List<AWS::EC2::AvailabilityZone::Name>" |
    "AWS::EC2::Image::Id" | "List<AWS::EC2::Image::Id>" |
    "AWS::EC2::Instance::Id" | "List<AWS::EC2::Instance::Id>" |
    "AWS::EC2::KeyPair::KeyName" |
    "AWS::EC2::SecurityGroup::GroupName" | "List<AWS::EC2::SecurityGroup::GroupName>" |
    "AWS::EC2::SecurityGroup::Id" | "List<AWS::EC2::SecurityGroup::Id>" |
    "AWS::EC2::Subnet::Id" | "List<AWS::EC2::Subnet::Id>" |
    "AWS::EC2::Volume::Id" | "List<AWS::EC2::Volume::Id>" |
    "AWS::EC2::VPC::Id" | "List<AWS::EC2::VPC::Id>" |
    "AWS::Route53::HostedZone::Id" | "List<AWS::Route53::HostedZone::Id>" |
    "AWS::SSM::Parameter::Name" |
    "AWS::SSM::Parameter::Value<String>" |
    "AWS::SSM::Parameter::Value<List<String>>" | "AWS::SSM::Parameter::Value<CommaDelimitedList>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::AvailabilityZone::Name>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::AvailabilityZone::Name>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::Image::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::Instance::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::Instance::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyName>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyName>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::GroupName>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::GroupName>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::Subnet::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::Subnet::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::Volume::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::Volume::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::VPC::Id>" | "AWS::SSM::Parameter::Value<List<AWS::EC2::VPC::Id>>" |
    "AWS::SSM::Parameter::Value<AWS::Route53::HostedZone::Id>" | "AWS::SSM::Parameter::Value<List<AWS::Route53::HostedZone::Id>>"


type ParameterSummary = {
    name: string
    type: ParameterType
    description: string | null
    default: string | null
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


type getAvailabilityZonesResponse = {
    error: string | null
    availabilityZones: string[] | null
}
type GetPlansResponse = {
    error: string | null
    plans: Plan[] | null
    nextToken: string | null
}
type PutPlanResponse = {
    error: string | null
    plan: Plan | null
}
type DeletePlanResponse = {
    error: string | null
    planName: string | null
}
type PutPlanRequest = Plan

type PlanStatus = "inProgress" | "completed" | "failed" | "unused"
type PlanDirection = "forward" | "backward"
type Plan = {
    planName: string
    flowName: string
    description: string | null
    lastStatus: PlanStatus
    direction: PlanDirection
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

// type NodeType = "stackNode" | "StackSetNode"
// type Node = import("reactflow").Node
type DeploymentConfig = {}
type BaseCUstomNodeData = {
    nodeId: string
    nodeName: string
    toolbarVisible: boolean
    nodeDeletable: boolean
    order: number | null
    deploymentPlans: {
        [name: string]: DeploymentConfig
    }
}

type StackNodeIO = {
    node: StackNode
    io: StackNodeParameter | StackNodeOutput
}
type StackNodeParameter = ParameterSummary & {
    visible: boolean
    // source: StackNodeParameterSource[]
    // dependencies: StackNodeIODependency[]
    selected: boolean
    // regionName: string | null
    accountId: string | null
}
type StackNodeOutput = OutputSummary & {
    visible: boolean
    // target: StackNodeOutputTarget[]
    // dependencies: StackNodeIODependency[]
    selected: boolean
    // regionName: string | null
    accountId: string | null

}
type StackNodeData = BaseCUstomNodeData & {
    regionName: string | null
    regionNames: string[]
    templateName: string | null
    parameters: StackNodeParameter[]
    outputs: StackNodeOutput[]
    isChild: boolean
}
type StackSetNodeData = BaseCUstomNodeData & {
    regionName: string | null
    regionNames: string[]
    templateName: string | null
    parameters: StackNodeParameter[] 
    outputs: StackNodeOutput[]
    isChild: boolean
}
type StartNodeData = BaseCUstomNodeData & {
}


type StartNodeType = import("reactflow").Node<StartNodeData> & {
}
type StackNodeType = import("reactflow").Node<StackNodeData> & {
    // type: CustomNodeTypeName
}
type StackSetNodeType = import("reactflow").Node<StackSetNodeData> & {
    // type: CustomNodeTypeName
}

type CustomNodeTypeName = "stackNode"| "stackSetNode" | "startNode"
type CustomNodeTypes = {
  [key in CustomNodeTypeName]: ComponentType<import("reactflow").NodeProps>
}
type StackNodeDataType = "nodeName" | "regionNames" | "templateName" | "regionName"

type CustomEdgeTypeName = "stackIOEdge" | "nodeOrderEdge"
type StackIOEdgeData = {
    sourceLable: string
    targetLabel: string
    // offset: number
}
type NodeOrderEdgeData = {}
type CustomEdgeTypes = {
    [key in CustomEdgeTypeName]: ComponentType<EdgeProps>
}
type StackIOEdgeType = import("reactflow").Edge<StackIOEdgeData>
type NodeOrderEdgeType = import("reactflow").Edge<NodeOrderEdgeData>
