export type ImageExtension = 'gif' | 'jpeg' | 'jpg' | 'png' | 'raw' | 'svg' | 'webp';
export type FitType = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

export type FileDto = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  originalname: string;
  size: number;
};

export type UploadedFileDto = {
  key: string;
  url: string;
};

export type UploadFileInputDto = {
  file: { buffer: Buffer; extension: string; mimetype: string };
  folder?: string;
};

export type UploadMultipleFilesInputDto = {
  files: { buffer: Buffer; extension: string; mimetype: string }[];
  folder?: string;
};

export type ProcessImageInputDto = {
  buffer: Buffer;
  format: ImageExtension;
  fit?: FitType;
  width?: number;
  height?: number;
  quality?: number;
};
