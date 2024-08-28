export class TypeNotWaterOrGasError extends Error {
  constructor(message?: string) {
    super(message ?? 'Tipo de medição não permitida');
    this.name = 'TypeNotWaterOrGasError';
  }
}
