export class InvalidFileExtension extends Error {
  constructor(message?: string) {
    super(message ?? 'Extensão de arquivo inválida');
    this.name = 'InvalidFileExtension';
  }
}
