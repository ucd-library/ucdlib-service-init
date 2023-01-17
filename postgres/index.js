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

  let files = sort(fs.readdirSync(dirPath));
  for( let file of files ) {
    if( path.parse(file).ext.toLowerCase() !== '.sql' ) continue;
    file = path.join(dirPath, file);
    logger.info('loading: '+file);
    let response = await client.query(fs.readFileSync(file, 'utf-8'));
    logger.debug(response);
  }
}

function sort(files) {
  files = files.map(file => {
    let index = 0;
    let name = file;
    if( file.match('-') ) {
      index = parseInt(file.split('-')[0]);
      name = file.split('-')[1];
    } 
    return {file, index, name};
  });

  files.sort((a,b) => {
    if( a.index < b.index ) return -1;
    if( a.index > b.index ) return 1;
    if( a.name < b.name ) return -1;
    if( a.name > b.name ) return 1;
    return 0;
  });

  return files.map(item => item.file);
}

export default run;