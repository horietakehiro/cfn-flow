import awsExports from './aws-exports';

const AmplifyConfig = {
    ...awsExports,
    API: {
      endpoints: [
        {
          name: "TemplatesApi",
          endpoint: "https://api.cfn-flow.ht-burdock.com/dev"
        },
        {
          name: "FlowsApi",
          endpoint: "https://api.cfn-flow.ht-burdock.com/dev",
        },
        {
          name: "StacksApi",
          endpoint: "https://api.cfn-flow.ht-burdock.com/dev",
        }
      ]
    },
}
export default AmplifyConfig