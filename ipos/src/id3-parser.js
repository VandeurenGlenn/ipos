import { createReadStream } from 'fs';
import musicmetadata from 'musicmetadata';

export default path => new Promise((resolve, reject) => {
  const stream = createReadStream(path);
  musicmetadata(stream, (error, meta) => {
    if (error) reject(error);
    stream.close();
    resolve(meta);
  });
});
