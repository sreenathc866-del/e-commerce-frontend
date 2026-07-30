-- ==============================================================================
-- PHASE 8: WEBHOOKS & IDEMPOTENCY
-- ==============================================================================

-- 1. Add event_id to webhook_logs for idempotency
ALTER TABLE public.webhook_logs
ADD COLUMN IF NOT EXISTS event_id TEXT;

-- 2. Add a UNIQUE constraint so the database physically prevents duplicates
-- (This ignores nulls, so older logs without an event_id won't crash)
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON public.webhook_logs(event_id) WHERE event_id IS NOT NULL;
