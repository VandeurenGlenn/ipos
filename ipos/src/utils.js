import {readFile} from 'fs';
import {promisify} from 'util';

import { startupLocation } from './params';

export const join = paths => [paths].reduce((p, c) => { p += `/${c}`}, '');

export const read = promisify(readFile)
