export class ReadingConfirmedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Leitura já confirmada');
    this.name = 'ReadingConfirmedError';
  }
}
