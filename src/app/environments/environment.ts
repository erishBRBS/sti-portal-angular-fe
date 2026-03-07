import { Environment } from "./environment.type";

export const environment: Environment = {
  production: false,
  apiUrl: 'https://dit-rfid.edu-nexus.org/api/v1',
  appName: 'STI EDU',
  version: '1.0.0',
  apiTimeout: 30_000, // 30 seconds
  staticFilesUrl: 'http://localhost:5210',
  fileUrl: 'https://dit-rfid.edu-nexus.org/storage/',
  appUrls: {
    id: 'http://localhost:4200',
  },
};
