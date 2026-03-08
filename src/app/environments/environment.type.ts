export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  apiTimeout: number;
  staticFilesUrl: string;
  fileUrl: string;
  appUrls: {
    id: string;
  };
  temp_token: string;
}
