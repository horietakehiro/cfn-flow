import awsExports from './aws-exports';

const AmplifyConfig = {
    ...awsExports,
    API: {
      endpoints: [
        {
          name: "TemplatesApi",
          endpoint: "https://api.cfn-flow.ht-burdock.com/dev"
          // endpoint: "https://l698x4atw0.execute-api.ap-northeast-1.amazonaws.com/dev"
        },
        {
          name: "FlowsApi",
          endpoint: "https://api.cfn-flow.ht-burdock.com/dev",
        }
      ]
    },
}
export default AmplifyConfig