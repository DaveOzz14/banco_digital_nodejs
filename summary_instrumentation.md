# OpenTelemetry Instrumentation Summary

## Overview

This document provides a complete summary of OpenTelemetry instrumentation implemented in the **banco_digital_nodejs** project for the **authorized payment flow only**.

---

## Architecture

### Single Instrumentation Entry Point (MANDATORY)

**Backend:**
- **File:** `backend/src/telemetry/instrumentation.js`
- **Purpose:** THE ONLY file that initializes OpenTelemetry SDK, configures exporters, and registers instrumentations
- **Exports:** `tracer`, `meter`, `logger`, `SeverityNumber`

**Frontend:**
- **File:** `frontend/src/telemetry/instrumentation.js`
- **Purpose:** THE ONLY file that initializes OpenTelemetry SDK for browser
- **Exports:** `tracer`

**Critical Rule:**
All other files MUST import `tracer`, `meter`, `logger` from these instrumentation files. NO other file may initialize SDK components, create resources, configure exporters, or register processors.

---

## Authorized Flow Instrumentation

### Flow Scope
The instrumentation covers ONLY the following user journey:

1. **Login** (`/`) → `frontend/src/pages/Login.jsx`
2. **Home** (`/Home`) → `frontend/src/pages/Home.jsx`
3. **Payment Form** (`/payment`) → `frontend/src/pages/PaymentForm.jsx`
4. **Pay Button** → API call to `POST http://localhost:3001/api/payment/pay`
5. **Payment Error Response** (`/payment/error`) → `frontend/src/pages/PaymentError.jsx`

### Excluded Flows
- ❌ Credit/Mortgage flows (`/credit`, `CreditForm.jsx`, `CreditConfirmation.jsx`)
- ❌ Any backend routes under `/api/credit`

---

## Backend Instrumentation

### Files Modified

#### 1. `backend/src/telemetry/instrumentation.js` (NEW)
**Purpose:** Single instrumentation entry point

**Features:**
- Parses `OTEL_RESOURCE_ATTRIBUTES` from `process.env`
- Manually constructs OpenTelemetry Resource (NO semantic-conventions import)
- Initializes `NodeSDK` with:
  - Batch trace exporter (OTLP HTTP)
  - Periodic metric exporter (OTLP HTTP, 60s interval)
  - Batch log exporter (OTLP HTTP)
- Registers automatic instrumentations:
  - `HttpInstrumentation`
  - `ExpressInstrumentation`
- Exports: `tracer`, `meter`, `logger`, `SeverityNumber`

---

#### 2. `backend/src/server.js` (MODIFIED)
**Changes:**
- **Line 1:** Imports `./telemetry/instrumentation.js` as a side-effect (MUST be first)
- Logs application startup using `logger.emit()`

---

#### 3. `backend/src/app.js` (MODIFIED)
**Changes:**
- Imports `meter` from instrumentation
- Creates custom metrics:
  - `http.server.requests` (Counter)
  - `http.server.request.duration` (Histogram)
  - `payment.requests.total` (Counter)
  - `payment.errors.total` (Counter)
- Middleware to record metrics on every HTTP request
- Tracks payment-specific metrics for `/api/payment/pay`

---

#### 4. `backend/src/payment/controllers/PaymentController.js` (MODIFIED)
**Changes:**
- Imports `tracer`, `logger`, `SeverityNumber`
- **Manual span:** `payment.controller.pay`
  - Attributes: `http.method`, `http.route`, `payment.card_number`, `payment.amount`, `payment.transaction_id`, `payment.status`
  - Records exception on error
  - Sets span status to `ERROR` when payment fails
- **Logs:**
  - INFO: "Processing payment request"
  - ERROR: "Payment failed" with transaction details
- Correlates logs with traces via `trace_id` and `span_id`

---

#### 5. `backend/src/payment/services/PaymentService.js` (MODIFIED)
**Changes:**
- Imports `tracer`, `logger`, `SeverityNumber`
- **Manual span:** `payment.service.process`
  - Attributes: `payment.amount`, `payment.card_last4`, `payment.transaction_id`, `payment.status`
  - Records exception on error
- **Logs:** INFO level for service processing
- Correlates logs with traces

---

#### 6. `backend/package.json` (MODIFIED)
**Changes:**
- Added OpenTelemetry dependencies (see STEP 8.5 below)

---

#### 7. `backend/.env.example` (NEW)
**Purpose:** Documents required environment variables
**Note:** Backend does NOT use `.env` files. Variables MUST be provided by OS.

---

## Frontend Instrumentation

### Files Modified

#### 1. `frontend/src/telemetry/instrumentation.js` (NEW)
**Purpose:** Single instrumentation entry point for browser

**Features:**
- Parses `VITE_OTEL_RESOURCE_ATTRIBUTES` from Vite environment
- Manually constructs Resource
- Initializes `WebTracerProvider` with:
  - Batch span processor
  - OTLP HTTP trace exporter
  - Zone context manager
- Registers `FetchInstrumentation` with CORS propagation for `http://localhost:3001`
- Exports: `tracer`

---

#### 2. `frontend/src/main.jsx` (MODIFIED)
**Changes:**
- **Line 1:** Imports `./telemetry/instrumentation.js` as a side-effect (MUST be first)

---

#### 3. `frontend/src/pages/Login.jsx` (MODIFIED)
**Changes:**
- Imports `tracer`
- **Manual span:** `user.login`
  - Attributes: `user.action`, `ui.component`, `ui.event`
  - Event: `login_form_submitted`
- Created on form submit

---

#### 4. `frontend/src/pages/Home.jsx` (MODIFIED)
**Changes:**
- Imports `tracer`
- **Manual span:** `page.home.view`
  - Attributes: `ui.component`, `ui.action`
  - Event: `home_page_loaded`
- Created in `useEffect` on component mount

---

#### 5. `frontend/src/pages/PaymentForm.jsx` (MODIFIED)
**Changes:**
- Imports `tracer`
- **Manual span:** `payment.form.pay_button`
  - Attributes: `user.action`, `ui.component`, `ui.event`, `payment.amount`, `payment.transaction_id`, `payment.status`, `http.status_code`
  - Events: `payment_api_call_initiated`, `payment_failed`
  - Records exception on fetch error
  - Sets span status to `ERROR` on non-200 response
- Span wraps the entire payment API call

---

#### 6. `frontend/src/pages/PaymentError.jsx` (MODIFIED)
**Changes:**
- Imports `tracer`
- **Manual span:** `page.payment_error.view`
  - Attributes: `ui.component`, `ui.action`, `payment.transaction_id`, `payment.error_message`
  - Event: `payment_error_page_displayed`
- Created in `useEffect` when error page loads

---

#### 7. `frontend/package.json` (MODIFIED)
**Changes:**
- Added OpenTelemetry dependencies (see STEP 8.5 below)

---

#### 8. `frontend/.env.example` (NEW)
**Purpose:** Documents required Vite environment variables
**Note:** Variables must be prefixed with `VITE_` to be exposed to frontend

---

## Observability Signals

### Traces
**Backend Spans:**
- `payment.controller.pay` (manual)
- `payment.service.process` (manual)
- Auto-instrumented HTTP spans (Express, HTTP client)

**Frontend Spans:**
- `user.login` (manual)
- `page.home.view` (manual)
- `payment.form.pay_button` (manual)
- `page.payment_error.view` (manual)
- Auto-instrumented fetch spans

**Trace Correlation:**
- Frontend → Backend via W3C Trace Context propagation (automatic via FetchInstrumentation)

---

### Metrics
**Backend Metrics:**
- `http.server.requests` (Counter) — Total HTTP requests by method, route, status
- `http.server.request.duration` (Histogram) — HTTP request duration in ms
- `payment.requests.total` (Counter) — Payment requests by status (success/failure)
- `payment.errors.total` (Counter) — Payment errors by HTTP status code

**Export Interval:** 60 seconds

---

### Logs
**Backend Logs:**
- Server startup (INFO)
- Payment request processing (INFO)
- Payment failures (ERROR)
- Controller errors (ERROR)

**Log-Trace Correlation:**
All logs include `trace_id` and `span_id` attributes for correlation

---

## Environment Configuration

### Backend Environment Variables
**Required (provided by OS, NOT .env file):**

```bash
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/logs
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTQ5OTM3MjpnbGNfZXlKdklqb2lNVFkwTk...
OTEL_SERVICE_NAME=banco_digital_observability
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.0.0
```

**How to Set (Linux/macOS):**
```bash
export OTEL_SERVICE_NAME=banco_digital_observability
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/traces
# ... set all other variables
cd backend
npm install
npm start
```

---

### Frontend Environment Variables
**Required (Vite environment):**

```bash
VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/traces
VITE_OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTQ5OTM3MjpnbGNfZXlKdklqb2lNVFkwTk...
VITE_OTEL_SERVICE_NAME=banco_digital_frontend
VITE_OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.0.0
```

**How to Set:**
Create `frontend/.env` file with above variables (prefixed with `VITE_`), or set in shell before running:

```bash
cd frontend
npm install
npm run dev
```

---

## Installation

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## Running the Application

### Backend
1. Set environment variables (see Backend Environment Variables above)
2. Run:
```bash
cd backend
npm start
```

### Frontend
1. Set environment variables in `frontend/.env` or shell
2. Run:
```bash
cd frontend
npm run dev
```

---

## Verification Checklist

✅ **Single Instrumentation Entry Point:**
- Backend: `backend/src/telemetry/instrumentation.js`
- Frontend: `frontend/src/telemetry/instrumentation.js`

✅ **No SDK Initialization Outside Instrumentation Files:**
- Verified: All other files only import and use exported instances

✅ **Authorized Flow Scope:**
- Login → Home → Payment → Pay Button → Payment Error
- Credit flows EXCLUDED

✅ **Manual Spans:**
- Backend: `payment.controller.pay`, `payment.service.process`
- Frontend: `user.login`, `page.home.view`, `payment.form.pay_button`, `page.payment_error.view`

✅ **Metrics:**
- HTTP request counter and duration histogram
- Payment-specific counters

✅ **Logs:**
- Correlated with traces via `trace_id` and `span_id`
- INFO and ERROR levels

✅ **Environment Configuration:**
- Backend: OS environment variables (NO dotenv)
- Frontend: Vite environment variables (prefixed with `VITE_`)

✅ **Transport:**
- OTLP HTTP/protobuf

✅ **Batch Processing:**
- Traces: BatchSpanProcessor
- Metrics: PeriodicExportingMetricReader (60s)
- Logs: BatchLogRecordProcessor

✅ **Automatic Instrumentation:**
- Backend: HttpInstrumentation, ExpressInstrumentation
- Frontend: FetchInstrumentation (with CORS propagation)

---

## Key Business Attributes

**Payment Flow:**
- `payment.amount`
- `payment.card_number` (masked as `****1234`)
- `payment.transaction_id`
- `payment.status`
- `payment.error_message`

**User Actions:**
- `user.action` (login, pay_credit_card)
- `ui.component` (Login, Home, PaymentForm, PaymentError)
- `ui.event` (form_submit, button_click, page_view)

**HTTP:**
- `http.method`
- `http.route`
- `http.status_code`

---

## Grafana Cloud Integration

All telemetry is exported to:
- **Traces:** `https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/traces`
- **Metrics:** `https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics`
- **Logs:** `https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/logs`

**Authentication:** Basic Auth via `OTEL_EXPORTER_OTLP_HEADERS`

---

## CRITICAL REMINDERS

1. **DO NOT** create helper functions, wrapper utilities, or abstraction layers for telemetry
2. **DO NOT** initialize SDK components outside instrumentation files
3. **DO NOT** use dotenv or .env file loading in Node.js backend
4. **DO NOT** instrument credit/mortgage flows
5. **ALWAYS** import `tracer`, `meter`, `logger` from instrumentation files
6. **ALWAYS** set environment variables via OS (backend) or Vite config (frontend)

---

## Support

For issues or questions:
- OpenTelemetry Docs: https://opentelemetry.io/docs/
- Grafana Cloud Docs: https://grafana.com/docs/grafana-cloud/

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-29  
**Branch:** `app_otel`
