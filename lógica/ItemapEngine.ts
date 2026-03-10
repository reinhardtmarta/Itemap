-- ITEMAP CLOUD SCHEMA v1.0
-- Este script define a estrutura da "Matéria Agrupada"

CREATE TABLE `itemap-project.inventory.aggregated_matter` (
  item_id STRING NOT NULL,         -- ID único do produto
  sku_master STRING NOT NULL,      -- SKU unificado para agrupamento
  technical_specs JSON NOT NULL,   -- Dados brutos para o protocolo ASA
  geo_location GEOGRAPHY NOT NULL, -- Coordenada exata da prateleira/loja
  stock_level INT64,               -- Quantidade verificada
  last_verified TIMESTAMP,         -- Timestamp para o Geofencing Feedback
  royalty_node FLOAT64 DEFAULT 0.05 -- Registro da taxa de licenciamento de 5%
);

