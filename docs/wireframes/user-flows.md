# Key User Flows

## Disaster Response Workflow
```mermaid
graph TD
    A[New Disaster Reported] --> B{Verify Location}
    B -->|Confirmed| C[AI Predicts Demand]
    B -->|Unconfirmed| D[Manual Entry]
    C --> E[Generate Routes]
    E --> F[Dispatch Resources]