import Monitoring from "./metrics.js";
monitoring = new Monitoring();

let filePath = env.METRICS_CONFIG || path.resolve(config.fsRoot, 'metrics.js');

(async function() {
  let metricConfigs;
  if( fs.existsSync(filePath) ) {
    logger.info('Using config file: '+filePath);
    metricConfigs = await import(filepath);
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