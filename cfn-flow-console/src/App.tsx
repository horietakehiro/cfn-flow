import { Amplify, Auth, API } from 'aws-amplify';
import {
  withAuthenticator, WithAuthenticatorOptions, WithAuthenticatorProps, 
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

import MainOutline from './components/main';

// Amplify.configure(awsExports);
Amplify.configure({
  Auth: {
    identityPoolId: "ap-northeast-1:c1df4feb-fbc6-4e8e-b088-f790e02040f2",
    region: "ap-northeast-1",
    userPoolId: "ap-northeast-1_NQ9m5lB7a",
    userPoolWebClientId: "6mlp7g6o4phbe9uprsr63hens1"
  },
  API: {
    endpoints: [
      {
        name: "TemplatesApi",
        endpoint: "https://7xkju28ytf.execute-api.ap-northeast-1.amazonaws.com"
      }
    ]
  }
});

interface Props extends WithAuthenticatorProps {
  isPassedToWithAuthenticator: boolean;
}
function App({isPassedToWithAuthenticator, signOut, user }: Props) {
  if (!isPassedToWithAuthenticator) {
    throw new Error(`isPassedToWithAuthenticator was not provided`);
  }

  return (
      <MainOutline signOut={signOut} user={user}/>
  );
}
const options: WithAuthenticatorOptions = {
  hideSignUp: true
}
export default withAuthenticator(App, options);

export async function getStaticProps() {
  return {
    props: {
      isPassedToWithAuthenticator: true,
    },
  };
}