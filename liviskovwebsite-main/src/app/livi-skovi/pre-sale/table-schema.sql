-- SQL para criar a tabela pre_sales no Supabase
CREATE TABLE pre_sales (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Se você quiser adicionar um índice para melhorar a performance de buscas
CREATE INDEX idx_pre_sales_email ON pre_sales(email);
CREATE INDEX idx_pre_sales_whatsapp ON pre_sales(whatsapp);