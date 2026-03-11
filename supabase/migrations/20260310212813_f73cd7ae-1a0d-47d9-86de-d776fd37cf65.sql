CREATE TABLE public.cached_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  predictions_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cached_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cached predictions readable by authenticated"
  ON public.cached_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage cache"
  ON public.cached_predictions
  FOR ALL
  TO service_role
  USING (true);