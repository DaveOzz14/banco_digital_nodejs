Act as a Senior Staff Software Engineer specialized in
OpenTelemetry, Grafana Cloud, and production-grade observability.

You have access to:
- A GitHub MCP server with branch and commit permissions

Your behavior MUST follow a strict, step-by-step execution pipeline.
You MUST execute actions, not describe intentions.

OBJECTIVE
Analyze, instrument, and commit OpenTelemetry observability
(TRACES, METRICS, LOGS) into a NEW GitHub branch named: app_otel

Target repository:DaveOzz14/banco_digital_nodejs

PIPELINE – MANDATORY EXECUTION STEPS
STEP 1 — FULL REPOSITORY ANALYSIS (READ-ONLY)
1. Read the ENTIRE repository from the default branch. 
2. Inspect all directories and files (Except files like Readme.md, Except Folders like node_modules).
3. Automatically detect and document internally:
   - Programming language(s)
   - Backend framework (FastAPI, Flask, Django, Primefaces, SpringBoot, Node, etc)
   - Frontend/UI technologies if present
   - Dependency manager and runtime
4. Inspect EXACT dependency versions from:
   - requirements.txt / pyproject.toml / package.json / pom.xml , etc
5. Do NOT modify or generate files in this step.

This step MUST complete before moving forward.


STEP 1.5 — TARGET FLOW DEFINITION & CODE SCOPING (READ-ONLY)
1. Define the ONLY allowed business flow to be instrumented:
AUTHORIZED FLOW
Login (/Login)
  → Home (/Home)
    → Credit Card Payment (/Payment)
      → Pay Button Action
        → Payment Response (/PaymentError)

2. Using the repository analysis from STEP 1, you MUST:
Identify ALL backend routes, controllers, services, handlers, etc.
Identify ALL frontend components, views, hooks, actions
Identify ALL API calls, HTTP clients, middleware
Identify ALL shared utilities
that are DIRECTLY involved in the authorized flow above.

3. You MUST construct an internal dependency graph limited STRICTLY to:
Files executed
Files imported
Files transitively required
ONLY when the authorized flow is executed

4. STRICT EXCLUSION RULES (NON-NEGOTIABLE)
You MUST NOT instrument, modify, or add telemetry to:
Mortgage / Home Loan flows
Crédito Hipotecario routes, services, UI, APIs

Any file not reachable from the authorized flow
Any background, batch, admin, or unrelated business logic

5. If a shared module is used by both:
Authorized flow ✅
Unauthorized flow ❌

THEN:
Instrument ONLY the code paths, functions, or handlers
executed by the authorized flow
DO NOT add global instrumentation that affects both flows

6. Output of this step is INTERNAL ONLY:
No files are created
No files are modified
No commits are made
This step ONLY constrains the scope of STEP 2 → STEP 7

7. ABSOLUTE RULE
Any telemetry outside the authorized flow is considered a FAILURE.
Only after this step is fully completed, you MAY proceed to STEP 2.

STEP 2 — OBSERVABILITY DESIGN & COMPATIBILITY VALIDATION
1. Select ONLY official, stable OpenTelemetry SDKs and Versions.
2. Ensure FULL compatibility with detected versions (NON-NEGOTIABLE).
3. Do NOT upgrade dependencies unless strictly required.
4. Design a configuration that:
   - Exports telemetry on FIRST RUN
   - Produces ZERO runtime, export, or startup errors
5. OTLP transport MUST be:
   - http/protobuf ONLY

STEP 3 — ENVIRONMENT CONFIGURATION
IMPORTANT: LANGUAGE-SPECIFIC RULES APPLY
1. Environment variables MUST be provided by the OPERATING SYSTEM
The application MUST read ALL OpenTelemetry configuration exclusively from process.env
Variables may be injected via:
Shell (export)
CI/CD
systemd
Docker / Kubernetes
No .env file is required nor allowed for Node.js backends

2. Node.js STRICT RULES (NON-NEGOTIABLE)
If the backend is Node.js:
DO NOT use:
dotenv
dotenv/config
.env file loading logic
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions'

You MUST:
Read all configuration from process.env
Manually construct the OpenTelemetry Resource

3. Required environment variables (must exist in the OS)
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/logs
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTQ5OTM3MjpnbGNfZXlKdklqb2lNVFkwTk...
OTEL_SERVICE_NAME=banco_digital_observability
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.0.0

4. Resource construction requirement (MANDATORY)
For Node.js, the OpenTelemetry Resource MUST be constructed explicitly as follows:
const resource = new Resource({
  ...(process.env.OTEL_SERVICE_NAME && {
    'service.name': process.env.OTEL_SERVICE_NAME
  }),
  ...parseResourceAttributes()
});

Where parseResourceAttributes() parses OTEL_RESOURCE_ATTRIBUTES from process.env.

4. If `.env.example` exists, update it accordingly.
STEP 4 — FULL OPEN TELEMETRY INSTRUMENTATION
You MUST implement ALL signals:

✔ Distributed Tracing  
✔ Metrics  
✔ Logs with trace/span correlation  

Mandatory requirements:
1. Explicitly configure:
   - TracerProvider
   - MeterProvider
   - LoggerProvider
2. Use Batch processors for all exporters.
3. Configure a Resource with:
   - service.name
   - service.version (if available)
   - deployment.environment
4. Enable automatic instrumentation for:
   - HTTP server
   - HTTP client
   - Database
   - Messaging (if applicable)

STEP 5 — MANUAL BUSINESS SPANS (NON-NEGOTIABLE)
You MUST add explicit manual spans for EVERY user-triggered action:
- Each API endpoint
- Each form submission
- Each UI interaction
- Each business transaction (login, checkout, payment, etc.)

For EACH manual span:
- Business-oriented span names
- Business attributes (user.id, order.id, payment.id, etc.)
- Exception recording
- ERROR status on failures
- Correct parent-child context

STEP 6 — METRICS & LOGS IMPLEMENTATION
Metrics:
- Explicit MeterProvider
- HTTP RED metrics
- Custom business metrics

Logs:
- Explicit LoggerProvider
- Export via /otlp/v1/logs
- Trace & span correlation
- Integrate with existing logging framework

STEP 7 — CREATE NEW BRANCH AND COMMIT
1. Create a NEW branch named: app_otel
2. The branch MUST include:
   - All modified and not modified source files
   - Dependency updates
   
3. Commit ALL generated ,modified and not modified files to `app_otel`.
4. NO changes must be committed to the original branch.
5. .env and .env.example MUST NOT be created for Node.js

STEP 8 — FINAL VALIDATION
Before finishing, verify internally that:
- No OTLP 4xx or 5xx errors occur
- Traces, metrics, and logs reach Grafana Cloud
- Application starts successfully on first run
- No deprecated or experimental APIs are used

STEP 8.5 — INSTRUMENTATION DEPENDENCY DISCLOSURE (MANDATORY OUTPUT)
As the FINAL step of the pipeline, you MUST:

1. Explicitly list in the chat output:
   - ALL new dependencies introduced exclusively for OpenTelemetry instrumentation
   - Only libraries that were NOT previously part of the project
   - Do NOT include existing application dependencies

2. For each dependency, specify:
   - Exact package name
   - Purpose (traces, metrics, logs, SDK, exporter, instrumentation)

3. Provide a SINGLE, copy-paste-ready installation command:
   - Using the detected dependency manager (npm, yarn, pnpm, pip, poetry, etc.)
   - Scoped ONLY to the backend project
   - With versions explicitly pinned or ranged to ensure compatibility

4. This output MUST be displayed directly in the chat.
   - No files
   - No comments
   - No assumptions
   - No omissions

5. This step is REQUIRED for validation and review.
6. Creat a file sumary_instrumentation.md with all the resume for instrumentation and push in branch.
   Absence of this output is considered a FAILURE of the pipeline.

FINAL OUTPUT REQUIREMENTS
- Show FULL content of each modified file
- Include file paths
- Code must be production-ready
- Suitable for Pull Request review

Execute this pipeline now, strictly in order.
Do NOT skip steps.
Do NOT describe actions — perform them.
