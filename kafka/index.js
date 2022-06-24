import logger from '../lib/logger.js';
import config from '../lib/config.js';
import waitUntil from '../lib/wait-until.js';
import exec from '../lib/exec.js';
import deepmerge from 'deepmerge';
import fs from "fs";
import path from 'path';

let filePath = process.env.KAFKA_TOPIC_CONFIG || path.resolve(config.fsRoot, 'kafka.js');

async function setupTopic(topic) {
  let defaults = deepmerge({}, config.kafka.topicDefaults);
  topic = deepmerge(defaults, topic);

  logger.info(`Ensuring ${topic.name}`);
  try {
    let output = await exec(`kafka-topics.sh --create \
    --if-not-exists \
    --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
    --replication-factor ${topic.replication_factor} \
    --partitions ${topic.partitions} \
    --topic ${topic.name}`);
    logger.info(output);

    for( let key in topic.options ) {
      logger.info(`Setting topic ${key}=${topic.options[key]} `);

      let output = await exec(`kafka-configs.sh --alter \
      --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
      --entity-type topics \
      --entity-name ${topic.name} \
      --add-config ${key}=${topic.options[key]}`);
      logger.info(output);
    }

  } catch(e) {
    logger.error(e);
  };
}

(async function() {
  // wait for kafka
  logger.info('Waiting for kafka: '+config.kafka.host+':'+config.kafka.port);
  await waitUntil(config.kafka.host, config.kafka.port);

  let topicConfigs;
  if( fs.existsSync(filePath) ) {
    logger.info('Using config file: '+filePath);
    topicConfigs = await import(filePath);
    if( topicConfigs.default ) topicConfigs = topicConfigs.default;
  } else {
    throw new Error('No kafka config file found: '+filePath);
  }

  for( let topic of topicConfigs ) {
    await setupTopic(topic);
  }

  logger.info('Kafka initialization complete.  Exiting. (this is supposed to happen)');
  setTimeout(() => {process.exit()});
})();