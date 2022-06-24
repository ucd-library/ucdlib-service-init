import Monitoring from "./metrics.js";
import config from "../lib/config.js";
import logger from "../lib/logger.js";
import path from "path";
import fs from "fs";

let monitoring = new Monitoring();

let filePath = process.env.METRICS_CONFIG || path.resolve(config.fsRoot, 'google-cloud-metrics.js');

(async function() {
  let metricConfigs;
  if( fs.existsSync(filePath) ) {
    logger.info('Using config file: '+filePath);
    metricConfigs = await import(filePath);
    if( metricConfigs.default ) metricConfigs = metricConfigs.default;
  } else {
    throw new Error('No metrics config file found: '+filePath);
  }

  for( let metric of metricConfigs ) {
    monitoring.registerMetric(metric);
  }
  await monitoring.ensureMetrics();

  logger.info('Google Cloud Metrics initialization complete.  Exiting. (this is supposed to happen)');
  setTimeout(() => {process.exit()});
})();