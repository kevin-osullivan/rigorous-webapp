declare module 'backblaze-b2' {
  interface B2Config {
    applicationKeyId: string;
    applicationKey: string;
  }

  interface UploadUrlResponse {
    data: {
      uploadUrl: string;
      authorizationToken: string;
    };
  }

  interface GetUploadUrlParams {
    bucketId: string;
  }

  interface GetDownloadAuthorizationParams {
    bucketId: string;
    fileNamePrefix: string;
    validDurationInSeconds: number;
  }

  interface DownloadAuthorizationResponse {
    data: {
      authorizationToken: string;
    };
  }

  class B2 {
    constructor(config: B2Config);
    authorize(): Promise<void>;
    getUploadUrl(params: GetUploadUrlParams): Promise<UploadUrlResponse>;
    getDownloadAuthorization(params: GetDownloadAuthorizationParams): Promise<DownloadAuthorizationResponse>;
  }

  export default B2;
} 