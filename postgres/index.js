import pg from 'pg';
import fs from 'fs';
import path from 'path';
import logger from '../lib/logger.js';
import config from '../lib/config.js';
import waitUntil from '../lib/wait-until.js';

const {Pool} = pg;
let dirPath = process.env.POSTGRES_CONFIG || path.resolve(config.fsRoot, 'postgres');


let client = new Pool({
  host : config.pg.host, 
  user : config.pg.user, 
  port : config.pg.port,
  database : config.pg.database
});

client.on('error', async e => {
  logger.error('Postgresql client error event', e);
});

async function run() {
  logger.info('waiting for postgres: '+config.pg.host+':'+config.pg.port)
  await waitUntil(config.pg.host, config.pg.port);
  await client.connect();

  // TODO: add migrations
  logger.info('loading sql files from: '+dirPath)

  let files = fs.readdirSync(dirPath);
  for( let file of files ) {
    if( path.parse(file).ext.toLowerCase() !== '.sql' ) continue;
    file = path.join(dirPath, file);
    logger.info('loading: '+file);
    let response = await client.query(fs.readFileSync(file, 'utf-8'));
    logger.debug(response);
  }
}

export default run;