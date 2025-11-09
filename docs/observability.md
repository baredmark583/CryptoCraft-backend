# Observability Guide

CryptoCraft backend now exposes structured logs, trace propagation, and Prometheus metrics so you can build dashboards in Grafana or set up alerts in your preferred toolset.

## Structured JSON logs

- Logging is powered by [`nestjs-pino`](https://github.com/iamolegga/nestjs-pino) with `traceId` auto-injected from the `x-trace-id` header.
- Request lifecycle events:
  - `http_request_start` – emitted when a request enters the API.
  - `http_request_complete` / `http_request_error` – emitted when the response is sent (includes status code and duration in milliseconds).
- All exception responses also emit `http_request_failed` with the same `traceId`, making cross-filtering in Grafana or Loki straightforward.

### Forwarding to Grafana / Loki

1. Point your log shipper (Vector, FluentBit, Promtail, etc.) at the application stdout.
2. Use the `service` field (`cryptocraft-backend`) as the primary label.
3. Add `traceId` as a label to stitch traces across services or to rehydrate frontend logs.

## Prometheus metrics

- Endpoint: `GET /metrics` (text/plain, Prometheus exposition format).
- Default metrics exported under the `cryptocraft_` prefix (`cryptocraft_process_cpu_user_seconds_total`, etc.).
- Custom HTTP metrics:
  - `cryptocraft_http_requests_total{method,route,status}`
  - `cryptocraft_http_request_duration_ms_bucket{method,route,status,le}` + `_sum`/`_count`

### Scraping configuration example

```yaml
- job_name: 'cryptocraft-api'
  scrape_interval: 15s
  metrics_path: /metrics
  scheme: https
  static_configs:
    - targets: ['api.cryptocraft.market']
```

### Grafana starter panels

| Panel | Query |
| --- | --- |
| Request rate | `sum(rate(cryptocraft_http_requests_total[5m])) by (route)` |
| Error budget | `sum(rate(cryptocraft_http_requests_total{status=~"5.."}[5m])) / sum(rate(cryptocraft_http_requests_total[5m]))` |
| P95 latency | `histogram_quantile(0.95, sum(rate(cryptocraft_http_request_duration_ms_bucket[5m])) by (le, route))` |

## Alert ideas

1. **API availability** – fire if error ratio > 2% for 5 minutes.
2. **Latency regression** – fire if P95 latency > 1.5s for a specific route.
3. **Metric silence** – fire if the Prometheus scrape fails for > 2 intervals.

## Trace IDs end-to-end

- Every request receives/propagates `x-trace-id`.
- The value is echoed back in every HTTP response and surfaces in logs + metrics (as labels), enabling correlation with browser logs, Telegram mini-app, or mobile clients.

Use this document as the baseline when onboarding new environments or when exporting dashboards between staging and production.
