// Global type declarations for build-time injected values

declare const process: {
  env: {
    HB_URL: string;
    HB_USERNAME: string;
    HB_PASSWORD: string;
  };
};
