export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: 'development' | 'production';
      ALLOWED_ORIGINS: string;
      TZ: string;
      DATABASE_HOST: string;
      DATABASE_PORT: string;
      DATABASE_PORT_TEST: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      DATABASE_URL: string;
    }
  }
}
