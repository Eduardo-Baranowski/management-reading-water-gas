export class ReadingAlreadyExistsError extends Error {
  constructor(message?: string) {
    super(message ?? 'Leitura do mês já realizada');
    this.name = 'ReadingAlreadyExistsError';
  }
}
