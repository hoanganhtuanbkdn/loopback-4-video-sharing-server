import * as fs from 'fs';

export const statPromise = (path: string): Promise<fs.Stats> =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) reject(err);

      resolve(stats);
    });
  });

export const unlinkPromise = async (path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const {F_OK} = fs.constants;
    fs.access(path, F_OK, err => {
      if (err) {
        console.log(`file is deleted: ${err}`);
        return resolve();
      }

      fs.unlink(path, error => {
        if (error) {
          console.log(`file is deleted - unlink: ${err}`);
          reject(error);
        }

        resolve();
      });
    });
  });
