-- Tabela configurations dla przechowywania konfiguracji użytkowników
-- Retencja: 2 lata (zgodnie z wymaganiami)

CREATE TABLE IF NOT EXISTS configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  sector TEXT NOT NULL,
  parameters JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  locked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_configurations_user_id ON configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_configurations_config_id ON configurations(config_id);
CREATE INDEX IF NOT EXISTS idx_configurations_sector ON configurations(sector);
CREATE INDEX IF NOT EXISTS idx_configurations_created_at ON configurations(created_at DESC);

-- Funkcja do automatycznego usuwania konfiguracji starszych niż 2 lata
CREATE OR REPLACE FUNCTION delete_old_configurations()
RETURNS void AS $$
BEGIN
  DELETE FROM configurations
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_configurations_updated_at
  BEFORE UPDATE ON configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - użytkownicy widzą tylko swoje konfiguracje
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Policy: użytkownicy mogą czytać tylko swoje konfiguracje
CREATE POLICY "Users can view own configurations"
  ON configurations
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: użytkownicy mogą tworzyć swoje konfiguracje
CREATE POLICY "Users can create own configurations"
  ON configurations
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: admini mogą widzieć wszystkie konfiguracje
CREATE POLICY "Admins can view all configurations"
  ON configurations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Komentarze dla dokumentacji
COMMENT ON TABLE configurations IS 'Przechowuje konfiguracje użytkowników z configuratorów (energia, ubezpieczenia, etc.). Retencja: 2 lata.';
COMMENT ON COLUMN configurations.config_id IS 'Unikalny identyfikator konfiguracji w formacie CFG-YYYY-MM-DD-XXXXXX';
COMMENT ON COLUMN configurations.user_id IS 'ID użytkownika który stworzył konfigurację';
COMMENT ON COLUMN configurations.sector IS 'Sektor: energy, insurance, telecom, mortgage, loan, leasing, creditcard, vacation';
COMMENT ON COLUMN configurations.parameters IS 'Parametry konfiguracji w formacie JSON';
COMMENT ON COLUMN configurations.locked IS 'Czy konfiguracja jest zablokowana (nie można edytować)';
