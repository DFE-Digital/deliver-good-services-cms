export default ({ env }) => ({
  
    upload: {
      config: {
        provider: 'strapi-provider-upload-azure-sa',
        providerOptions: {
          account: env('AZURE_STORAGE_ACCOUNT') || env('AZURE_ACCOUNT_NAME'),
          accountKey: env('AZURE_STORAGE_ACCOUNT_KEY') || env('AZURE_ACCOUNT_KEY'),
          serviceBaseURL: env('AZURE_STORAGE_URL'),
          containerName: env('AZURE_STORAGE_CONTAINER_NAME') || env('AZURE_CONTAINER_NAME'),
          defaultPath: env('AZURE_DEFAULT_PATH') || 'uploads',
          cdnBaseURL: env('AZURE_CDN_URL'),
        },
      },
    },
  });
  
