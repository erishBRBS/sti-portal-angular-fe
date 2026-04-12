import { Environment } from "./environment.type";

export const environment: Environment = {
  production: false,
  apiUrl: 'https://dit-rfid.edu-nexus.org/api/v1/',
  pythonUrl: 'http://localhost:9000/',
  appName: 'STI EDU',
  version: '1.0.0',
  apiTimeout: 30_000, // 30 seconds
  staticFilesUrl: 'http://localhost:5210',
  fileUrl: 'https://dit-rfid.edu-nexus.org/storage/',
  appUrls: {
    id: 'http://127.0.0.1:8000/api/v1/',
  },
  temp_token: "1|1nSkAxdcBmYNGKwrDlcBXU4ERO3ffTX1fBhFMilY647f6ac1",
};
