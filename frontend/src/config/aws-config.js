// AWS Amplify Configuration
export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  },
  API: {
    REST: {
      VMailAPI: {
        endpoint: process.env.REACT_APP_API_ENDPOINT,
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
      }
    }
  },
  Storage: {
    S3: {
      bucket: process.env.REACT_APP_EMAIL_BUCKET,
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
    }
  }
};

export const apiConfig = {
  endpoints: {
    sendEmail: '/emails/send',
    listEmails: '/emails',
    getEmail: '/emails',
    deleteEmail: '/emails'
  }
};

export const sesConfig = {
  fromEmail: process.env.REACT_APP_SES_FROM_EMAIL,
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
};
