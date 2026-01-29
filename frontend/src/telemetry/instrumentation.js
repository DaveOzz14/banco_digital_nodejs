import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { trace } from '@opentelemetry/api';

// Parse OTEL_RESOURCE_ATTRIBUTES
function parseResourceAttributes() {
  const attrs = {};
  const envAttrs = import.meta.env.VITE_OTEL_RESOURCE_ATTRIBUTES;
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

// Construct Resource manually
const resource = new Resource({
  ...(import.meta.env.VITE_OTEL_SERVICE_NAME && {
    'service.name': import.meta.env.VITE_OTEL_SERVICE_NAME
  }),
  ...parseResourceAttributes()
});

// OTLP Trace Exporter
const traceExporter = new OTLPTraceExporter({
  url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  headers: {
    Authorization: import.meta.env.VITE_OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] || ''
  }
});

// TracerProvider
const provider = new WebTracerProvider({
  resource
});

provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
provider.register({
  contextManager: new ZoneContextManager()
});

// Register automatic instrumentation
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [
        /http:\/\/localhost:3001\/.*/, // Backend API
      ],
      clearTimingResources: true
    })
  ]
});

// Export tracer instance
export const tracer = trace.getTracer('banco-digital-frontend', '1.0.0');
