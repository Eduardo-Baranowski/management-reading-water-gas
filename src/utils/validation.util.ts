import { ZodError } from 'zod';

interface ValidationError {
  type: 'validation';
  message: string;
  path: string;
  code: string;
}

export const validationError = (error: ZodError): ValidationError => {
  const { message, path, code } = error.issues[0];

  return {
    type: 'validation',
    message,
    path: path.slice(1, path.length).join('.'),
    code,
  };
};
