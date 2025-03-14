/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL: string;
    REACT_APP_FRONTEND_URL: string;
    REACT_APP_ENABLE_ANALYTICS: string;
    REACT_APP_ENABLE_DEBUG_MODE: string;
    REACT_APP_ENCRYPTION_KEY_LENGTH: string;
    REACT_APP_ENCRYPTION_IV_LENGTH: string;
  }
} 