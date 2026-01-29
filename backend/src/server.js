// MUST import instrumentation FIRST (side-effect)
import './telemetry/instrumentation.js';
import app from './app.js';
import { logger, SeverityNumber } from './telemetry/instrumentation.js';

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🏦 Banking API running on port ${PORT}`);
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: `Banking API started on port ${PORT}`,
    attributes: {
      'service.port': PORT,
      'event.name': 'server.start'
    }
  });
});
