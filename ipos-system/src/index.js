import Program from './interface/program';
import ProgramBase from './interface/program-base';

import api from '../../ipos-api/src/index.js';

import define from '../node_modules/backed/src/utils/define';
import merge from '../node_modules/backed/src/utils/merge';

import elementBase from './composers/element-base.js';

import './globals/require.js';
import './globals/buffer.js';
import './globals/path.js';
import './globals/paths.js';

window.system = { ProgramBase, Program, define, merge, api, elementBase };
import('../../ipos-window-manager/src/index.js');

import('./elements/system-layout.js');
import('./elements/system-item.js');
import('./elements/system-icon.js');
import('./elements/system-icons.js');
import('./elements/system-shortcut.js');
import('./elements/system-audio.js');
import('./elements/system-webview.js');
