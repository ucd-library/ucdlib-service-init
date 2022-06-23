import logger from '../lib/logger.js';
import config from '../lib/config.js';
import waitUntil from '../lib/wait-until.js';
import exec from '../lib/exec.js';
import fs from "fs";
import path from 'path';

let filePath = env.KAFKA_TOPIC_CONFIG || path.resolve(config.fsRoot, 'kafka.js');

async function setupTopic(topic) {
  topic = Object.assign({}, topic, config.kafka.topicDefaults);

  logger.info(`Ensuring ${topic.name}`);
  try {
    var {stdout, stderr} = exec(`kafka-topics.sh --create \
    --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
    --replication-factor ${topic.replication_factor} \
    --partitions ${topic.partitions} \
    --topic ${topic.name}`);
  
    logger.info(`Setting topic retention: ${topic.retention/(1000*60*60*24)} days`);

    var {stdout, stderr} = exec(`kafka-configs.sh --alter \
    --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
    --entity-type topics \
    --entity-name ${topic.name} \
    --add-config retention.ms=${topic.retention}`);

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
    topicConfigs = await import(filepath);
  } else {
    throw new Error('No kafka config file found: '+filePath);
  }

  for( let topic of topicConfigs ) {
    await setupTopic(topic);
  }

  logger.info('Kafka initialization complete.  Exiting. (this is supposed to happen)');
  setTimeout(() => {process.exit()});
})();