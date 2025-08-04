module.exports = {
  plugin: function() {
    const metrics = {};

    return {
      hooks: {
        'stats': function(stats) {
          const key = `${stats.scenario} ${stats.request.method} ${stats.request.url}`;
          
          if (!metrics[key]) {
            metrics[key] = {
              count: 0,
              mean: 0,
              min: Infinity,
              max: 0,
              errors: 0
            };
          }

          const metric = metrics[key];
          metric.count++;
          metric.mean = (metric.mean * (metric.count - 1) + stats.latency) / metric.count;
          metric.min = Math.min(metric.min, stats.latency);
          metric.max = Math.max(metric.max, stats.latency);
          
          if (stats.code !== 200) {
            metric.errors++;
          }
        },
        'done': function(report) {
          report.metricsByEndpoint = metrics;
          return report;
        }
      }
    };
  }
};