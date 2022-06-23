import config from '../lib/config.js';
import logger from './lib/logger.js';
import monitoring from '@google-cloud/monitoring';

// https://cloud.google.com/monitoring/custom-metrics/creating-metrics

/** 
 * There is no cli for metric description removal (dump).  Here is a quick script
 * 
 * const monitoring = require('@google-cloud/monitoring');
 * let client = new monitoring.MetricServiceClient({keyFilename: '/etc/google/service-account.json'})
 * client.deleteMetricDescriptor({name:'projects/digital-ucdavis-edu/metricDescriptors/custom.googleapis.com/krm/tasks_ready'}).then(e => console.log(e))
 */

class Monitoring {

  constructor() {
    let clientConfig = {
      keyFilename : config.google.applicationCredentials
    };
    this.client = new monitoring.MetricServiceClient(clientConfig);

    this.metrics = {};
  }

  registerMetric(metric, opts={}) {
    if( !metric.metricDescriptor ) {
      metric = {
        name : this.client.projectPath(config.google.projectId),
        metricDescriptor : metric
      }
    }

    this.metrics[metric.metricDescriptor.type] = {metric, opts};
  }

  async ensureMetrics() {
    for( let key in this.metrics ) {
      logger.info('Ensuring metric: ', key);
      await this.ensureMetric(this.metrics[key].metric);
    }
  }

  ensureMetric(metric) {
    return this.client.createMetricDescriptor(metric);
  }

}


export default Monitoring;