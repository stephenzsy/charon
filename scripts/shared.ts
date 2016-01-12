import * as path from 'path';
import * as fsExtra from 'fs-extra';

export const ConfigDir: string = path.join(__dirname, '../config');
export const ConfigInitDir: string = path.join(ConfigDir, 'init');

export function writeJsonSync(path, obj): void {
  fsExtra.writeJsonSync(path, obj);
}
