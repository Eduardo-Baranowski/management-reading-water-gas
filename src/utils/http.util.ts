export type HttpError = {
  message: string;
};

export const httpError = (error: Error): HttpError => {
  return {
    message: error.message,
  };
};
