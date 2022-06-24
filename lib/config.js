import fs from 'fs';
const env = process.env;

let credentialProjectId;
if( env.GOOGLE_APPLICATION_CREDENTIALS ) {
  let content = JSON.parse(fs.readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));
  credentialProjectId = content.project_id;
}

// k8s inserts a kafka port like tcp://10.109.128.0:9092.  clean up
let kafkaPort = env.KAFKA_PORT;
if( kafkaPort && kafkaPort.match(/:/) ) {
  kafkaPort = kafkaPort.split(':').pop();
}

let config = {

  fsRoot : env.CONFIG_ROOT || '/etc/ucdlib-service-init',

  google : {
    applicationCredentials : env.GOOGLE_APPLICATION_CREDENTIALS || '',
    projectId : env.GOOGLE_PROJECT_ID || credentialProjectId ||  ''
  },


  kafka : {
    port : kafkaPort || 9092,
    host : env.KAFKA_HOST || 'kafka',
    topicDefaults : {
      partitions : 10,
      replication_factor : 1,
      options : {
        'retention.ms' : 604800000
      }
    }
  },

  logging : {
    quite : (env.LOG_QUITE === 'true'),
    name : env.LOG_NAME || 'ucdlib-service-init',
    level : env.LOG_LEVEL || 'info'
  }
}

export default config