export type Type = 'water' | 'gas';

export type ReadingDto = {
  // id: number;
  // customerCode: string;
  measure_uuid: string;
  measure_value: number;
  // measureType: Type;
  // createdAt: Date;
  // updatedAt: Date;
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
  measureValue: number;
  measureUUID: string;
  image: string;
};
