import logger from '../lib/logger.js';
import run from './index.js';

run().then(() => {
  logger.info('Exiting. (this is supposed to happen)');
  process.exit();
});