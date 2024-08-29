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
      GEMINI_API_KEY: string;

      AVATAR_SIZE: string;

      PGADMIN_PORT:string;

      AWS_REGION: string;
      AWS_ACCESS_KEY_ID:string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_BUCKET_NAME:string;
      AWS_BUCKET_URL:string;
    }
  }
}
