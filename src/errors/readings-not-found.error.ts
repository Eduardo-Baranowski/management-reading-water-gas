export class ReadingsFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Nenhuma leitura encontrada');
    this.name = 'ReadingsFoundError';
  }
}
