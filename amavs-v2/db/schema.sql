-- AMAVS Turismo — Schema MySQL
-- Execute no painel do Hostinger > Banco de dados > phpMyAdmin

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- Usuários admin
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100) NOT NULL,
  `username`      VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(150),
  `role`          ENUM('admin','operator','viewer') NOT NULL DEFAULT 'operator',
  `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `last_login`    DATETIME,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Senhas padrão (admin123 e op2024) — TROQUE em produção!
INSERT IGNORE INTO `admin_users` (name,username,password_hash,role) VALUES
('Administrador','admin', '$2y$12$wVHiEi5cWXVJX9JxaZjUZO7m2DwJk3.j7I1Pu8Q4n0q1I0Y6MV8B6','admin'),
('Operacional','operador','$2y$12$cPLxMnHKNgPv7CUO8L9U9.yG8VJmLN6bRRl3YBT6wOpVjbG6WlXwi','operator');

-- Orçamentos
CREATE TABLE IF NOT EXISTS `orcamentos` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`         VARCHAR(20) NOT NULL UNIQUE,
  `nome`         VARCHAR(100) NOT NULL,
  `empresa`      VARCHAR(150),
  `telefone`     VARCHAR(20) NOT NULL,
  `email`        VARCHAR(150),
  `origem`       VARCHAR(200) NOT NULL,
  `destino`      VARCHAR(200) NOT NULL,
  `data_ida`     DATE,
  `data_volta`   DATE,
  `passageiros`  SMALLINT UNSIGNED,
  `tipo_viagem`  VARCHAR(50),
  `canal`        VARCHAR(20) DEFAULT 'whatsapp',
  `observacoes`  TEXT,
  `veiculo_id`   INT UNSIGNED,
  `valor`        DECIMAL(10,2),
  `status`       ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
  `notes`        TEXT,
  `ip`           VARCHAR(45),
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Veículos
CREATE TABLE IF NOT EXISTS `veiculos` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(100) NOT NULL,
  `model`        VARCHAR(100) NOT NULL,
  `category`     ENUM('onibus','micro','van') NOT NULL,
  `capacity`     TINYINT UNSIGNED NOT NULL,
  `year`         SMALLINT UNSIGNED,
  `plate`        VARCHAR(10),
  `km`           INT UNSIGNED DEFAULT 0,
  `price_km`     DECIMAL(8,2),
  `price_day`    DECIMAL(8,2),
  `status`       ENUM('available','maintenance','unavailable') DEFAULT 'available',
  `next_service` DATE,
  `image`        VARCHAR(255),
  `features`     JSON,
  `description`  TEXT,
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contratos / Licitações
CREATE TABLE IF NOT EXISTS `contratos` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`         VARCHAR(30) NOT NULL UNIQUE,
  `client`       VARCHAR(200) NOT NULL,
  `modality`     VARCHAR(100),
  `start_date`   DATE,
  `end_date`     DATE,
  `value`        DECIMAL(12,2) DEFAULT 0,
  `status`       ENUM('active','pending_licit','ended') DEFAULT 'active',
  `image`        VARCHAR(255),
  `description`  TEXT,
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Log de autenticação
CREATE TABLE IF NOT EXISTS `auth_log` (
  `id`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50),
  `ip`       VARCHAR(45),
  `success`  TINYINT(1) DEFAULT 0,
  `ts`       DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ts` (`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET foreign_key_checks = 1;
