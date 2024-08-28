import { encode, decode } from 'blurhash';
import sharp from 'sharp';

import { ProcessImageInputDto } from '@/dtos';

type BlurhashOutput = {
  buffer: Buffer;
  hash: string;
};

export class SharpImageProcessingService {
  async process({
    buffer,
    format,
    fit,
    width,
    height,
    quality,
  }: ProcessImageInputDto): Promise<Buffer> {
    const image = sharp(buffer).toFormat(format);

    if (width || height) {
      image.resize(width, height, {
        fit,
      });
    }

    if (quality) {
      image.jpeg({ quality });
    }

    return image.toBuffer();
  }

  async blurhash(buffer: Buffer): Promise<BlurhashOutput> {
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const encoded = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
    const decoded = decode(encoded, info.width, info.height);

    const outputBuffer = await sharp(Buffer.from(decoded), {
      raw: {
        channels: 4,
        width: info.width,
        height: info.height,
      },
    })
      .jpeg({
        overshootDeringing: true,
        quality: 40,
      })
      .toBuffer();

    return {
      buffer: outputBuffer,
      hash: encoded,
    };
  }
}
