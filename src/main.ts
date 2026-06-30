import 'plantasonic-design-system/css/variables.css';
import './styles/index.scss';

import { StartupController } from './startup/StartupController.js';

document.documentElement.classList.add('s9-themed');

const container = document.querySelector<HTMLElement>('#app');

if (!container) {
  throw new Error('Mount point #app not found');
}

const startup = new StartupController(container);
startup.start();
