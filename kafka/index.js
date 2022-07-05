import logger from '../lib/logger.js';
import config from '../lib/config.js';
import waitUntil from '../lib/wait-until.js';
// import exec from '../lib/exec.js';
import Kafka from 'kafkajs';
import deepmerge from 'deepmerge';
import fs from "fs";
import path from 'path';

const ConfigResourceTypes = Kafka.ConfigResourceTypes;
let filePath = process.env.KAFKA_TOPIC_CONFIG || path.resolve(config.fsRoot, 'kafka.js');

const kafka = new Kafka.Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.host + ':' + config.kafka.port]
});
let admin = kafka.admin()

async function setupTopic(topic, existingTopics) {
  let defaults = deepmerge({}, config.kafka.topicDefaults);
  topic = deepmerge(defaults, topic);

  logger.info(`Ensuring ${topic.name}`);
  try {

    if( !existingTopics.includes(topic.name) ) {
      await admin.createTopics({
        validateOnly: false,
        waitForLeaders: false,
        timeout: 10000,
        topics: [{
          topic : topic.name,
          numPartitions : topic.partitions,
          replicationFactor : topic.replication_factor
        }]
      })
    } else {
      logger.info(`Topic ${topic.name} already exits, ignore creation`);
    }
    // let output = await exec(`kafka-topics.sh --create \
    // --if-not-exists \
    // --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
    // --replication-factor ${topic.replication_factor} \
    // --partitions ${topic.partitions} \
    // --topic ${topic.name}`);
    // logger.info(output);

    let configEntries = [];
    for( let key in topic.options ) {
      logger.info(`Setting topic ${key}=${topic.options[key]} `);
      configEntries.push({
        name : key,
        value : topic.options[key]+''
      });

      // let output = await exec(`kafka-configs.sh --alter \
      // --bootstrap-server ${config.kafka.host}:${config.kafka.port} \
      // --entity-type topics \
      // --entity-name ${topic.name} \
      // --add-config ${key}=${topic.options[key]}`);
      // logger.info(output);
    }

    await admin.alterConfigs({
      validateOnly: false,
      resources: [{
        type: ConfigResourceTypes.TOPIC,
        name: topic.name,
        configEntries
      }]
    })

  } catch(e) {
    logger.error(e);
  };
}

async function run() {
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

  await admin.connect();
  let topics = await admin.listTopics()

  for( let topic of topicConfigs ) {
    await setupTopic(topic, topics);
  }

  logger.info('Kafka initialization complete.');
};

export default run;