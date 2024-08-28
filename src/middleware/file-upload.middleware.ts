import { RequestHandler } from 'express';

import multer from 'multer';
import path from 'node:path';

import { InvalidFileExtension } from '@/errors';

import { httpError } from '@/utils';

interface Input {
  fieldName: string;
  allowedFileExtensions?: string[];
}

export const singleFileUpload = ({ fieldName, allowedFileExtensions }: Input): RequestHandler => {
  const uploader = multer({
    storage: multer.memoryStorage(),
    fileFilter: (request, file, cb) => {
      // eslint-disable-next-line no-param-reassign
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const ext = path.extname(file.originalname).replace('.', '');

      if (allowedFileExtensions?.length && !allowedFileExtensions.includes(ext)) {
        return cb(
          new InvalidFileExtension(`Arquivos permitidos: ${allowedFileExtensions.join(', ')}`),
        );
      }

      return cb(null, true);
    },
  });

  return (request, response, next) => {
    uploader.single(fieldName)(request, response, error => {
      if (error instanceof multer.MulterError) {
        return next(error);
      }

      if (error instanceof InvalidFileExtension) {
        return response.status(400).json(httpError(error));
      }

      return next();
    });
  };
};

export const multipleFilesUpload = ({
  fieldName,
  allowedFileExtensions,
}: Input): RequestHandler => {
  const uploader = multer({
    storage: multer.memoryStorage(),
    fileFilter: (request, file, cb) => {
      // eslint-disable-next-line no-param-reassign
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const ext = path.extname(file.originalname).replace('.', '');

      if (allowedFileExtensions?.length && !allowedFileExtensions.includes(ext)) {
        return cb(
          new InvalidFileExtension(`Arquivos permitidos: ${allowedFileExtensions.join(', ')}`),
        );
      }

      return cb(null, true);
    },
  });

  return (request, response, next) => {
    uploader.array(fieldName)(request, response, error => {
      if (error instanceof multer.MulterError) {
        return next(error);
      }

      if (error instanceof InvalidFileExtension) {
        return response.status(400).json(httpError(error));
      }

      return next();
    });
  };
};
