import awsExports from './aws-exports';

const AmplifyConfig = {
    ...awsExports,
    API: {
      endpoints: [
        {
          name: "TemplatesApi",
          endpoint: "https://7xkju28ytf.execute-api.ap-northeast-1.amazonaws.com/dev"
        }
      ]
    },
}
export default AmplifyConfig