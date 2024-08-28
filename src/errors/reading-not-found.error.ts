export class ReadingFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Leitura não encontrado');
    this.name = 'ReadingFoundError';
  }
}
