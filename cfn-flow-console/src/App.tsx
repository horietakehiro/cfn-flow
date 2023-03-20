import { Amplify, Auth, API } from 'aws-amplify';
import {
  withAuthenticator, WithAuthenticatorOptions, WithAuthenticatorProps,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import MainOutline from './components/main';

import AmplifyConfig from './AmplifyConfig';

// Amplify.configure(awsExports);
Amplify.configure(AmplifyConfig);

interface Props extends WithAuthenticatorProps {
  isPassedToWithAuthenticator: boolean;
}
function App({ isPassedToWithAuthenticator, signOut, user }: Props) {
  if (!isPassedToWithAuthenticator) {
    throw new Error(`isPassedToWithAuthenticator was not provided`);
  }

  return (
    <MainOutline signOut={signOut} user={user} />
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