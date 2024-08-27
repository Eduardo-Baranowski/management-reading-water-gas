import { addAlias } from 'module-alias';
import { resolve } from 'node:path';

addAlias('@', resolve(process.env.NODE_ENV === 'development' ? 'src' : 'dist'));
