import express from 'express';
import cors from 'cors';
import creditRoutes from './credit/routes/credit.routes.js';
import paymentRoutes from './payment/routes/payment.routes.js';
import { meter } from './telemetry/instrumentation.js';

const app = express();

// Custom metrics
const httpRequestCounter = meter.createCounter('http.server.requests', {
  description: 'Total number of HTTP requests',
  unit: '1'
});

const httpRequestDuration = meter.createHistogram('http.server.request.duration', {
  description: 'HTTP request duration',
  unit: 'ms'
});

const paymentCounter = meter.createCounter('payment.requests.total', {
  description: 'Total payment requests',
  unit: '1'
});

const paymentErrorCounter = meter.createCounter('payment.errors.total', {
  description: 'Total payment errors',
  unit: '1'
});

// Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    httpRequestCounter.add(1, {
      'http.method': req.method,
      'http.route': req.route?.path || req.path,
      'http.status_code': res.statusCode
    });

    httpRequestDuration.record(duration, {
      'http.method': req.method,
      'http.route': req.route?.path || req.path,
      'http.status_code': res.statusCode
    });

    // Track payment-specific metrics
    if (req.path.includes('/payment/pay')) {
      paymentCounter.add(1, {
        'payment.status': res.statusCode === 200 ? 'success' : 'failure'
      });

      if (res.statusCode !== 200) {
        paymentErrorCounter.add(1, {
          'http.status_code': res.statusCode
        });
      }
    }
  });

  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/credit', creditRoutes);
app.use('/api/payment', paymentRoutes);

export default app;
