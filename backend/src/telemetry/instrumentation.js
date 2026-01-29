import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { trace } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api';

// Parse OTEL_RESOURCE_ATTRIBUTES from environment
function parseResourceAttributes() {
  const attrs = {};
  const envAttrs = process.env.OTEL_RESOURCE_ATTRIBUTES;
  if (envAttrs) {
    envAttrs.split(',').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) {
        attrs[key.trim()] = value.trim();
      }
    });
  }
  return attrs;
}

// Construct Resource manually (DO NOT use semantic-conventions imports)
const resource = new Resource({
  ...(process.env.OTEL_SERVICE_NAME && {
    'service.name': process.env.OTEL_SERVICE_NAME
  }),
  ...parseResourceAttributes()
});

// OTLP Exporters
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  headers: {
    Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] || ''
  }
});

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  headers: {
    Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] || ''
  }
});

const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
  headers: {
    Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] || ''
  }
});

// Initialize NodeSDK
const sdk = new NodeSDK({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000
  }),
  logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation()
  ]
});

// Start SDK
sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

// Export initialized instances
export const tracer = trace.getTracer('banco-digital-backend', '1.0.0');
export const meter = metrics.getMeter('banco-digital-backend', '1.0.0');
export const logger = logs.getLogger('banco-digital-backend', '1.0.0');
export { SeverityNumber };
