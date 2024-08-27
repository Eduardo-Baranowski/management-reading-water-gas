export class ReadingAlreadyExistsError extends Error {
  constructor(message?: string) {
    super(message ?? 'Já existe uma leitura para este tipono mês atual');
    this.name = 'ReadingAlreadyExistsError';
  }
}
