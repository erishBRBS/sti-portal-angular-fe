export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  apiTimeout: number;
  staticFilesUrl: string;
  appUrls: {
    id: string;
  };
}
