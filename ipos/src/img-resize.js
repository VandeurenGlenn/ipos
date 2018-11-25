import sharp from 'sharp';
import { read } from './utils';

/**
 * @param {buffer} path
 */
export default async ({path, buffer, width = 64, height = 64, out}) => {
  if (!path) throw 'Expected path to be defined';
  if (!buffer) buffer = await read(path);
  if (!out) {
    if (width === height) out = `${path}-${width}.webp`;
    else out = `${path}-${width}-${height}.webp`;
  }

  sharp(buffer)
  .resize(width, height)
  .toFile(out, (error, info) => {
    if (error) throw error;
  });
}
