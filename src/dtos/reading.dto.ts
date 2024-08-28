import { FileDto } from './file.dto';

export type Type = 'water' | 'gas';

export type ReadingDto = {
  id: number;
  measure_uuid: string;
  measure_value: number;
  image_url?: string;
};

export type ReadingOutputDto = Omit<ReadingDto, 'id'> & {
  measure_uuid: string;
  measure_value: number;
  image_url?: string;
};

export type ReadingExistsInputDto = {
  measureDatetime?: Date;
};

export type ImageIsNoteBase64InputDto = {
  image: string;
};

export type UpdateReadingImageInputDto = {
  id: number;
  file: FileDto;
};

export type CreateReadingInputDto = {
  customerCode: string;
  measureDatetime: Date;
  measureType: Type;
  measureValue?: number;
  measureUUID?: string;
  image: string;
};

export type UpdateReadingInputDto = {
  confirmed_value: number;
  measure_uuid: string;
};
