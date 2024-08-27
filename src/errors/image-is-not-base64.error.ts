export class ImageIsNotBase64Error extends Error {
  constructor(message?: string) {
    super(message ?? 'Imagem não possui formato base64');
    this.name = 'ImageIsNotBase64Error';
  }
}
