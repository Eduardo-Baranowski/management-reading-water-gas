export type Type = 'water' | 'gas';

export type ReadingDto = {
  id: number;
  customerCode: string;
  measureDatetime: Date;
  measureType: Type;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingExistsInputDto = {
  measureDatetime?: Date;
};

export type ImageIsNoteBase64InputDto = {
  image: string;
};

export type CreateReadingInputDto = {
  customerCode: string;
  measureDatetime: Date;
  measureType: Type;
  image: string;
};
