<?php
// AMAVS Turismo — Configuração do banco de dados
// Configure estas variáveis no painel do Hostinger
define('DB_HOST', 'localhost');
define('DB_NAME', 'u_amavsturismo');  // altere conforme o Hostinger
define('DB_USER', 'u_amavsturismo');  // altere conforme o Hostinger
define('DB_PASS', 'SUA_SENHA_AQUI');  // altere para sua senha real
define('DB_CHARSET', 'utf8mb4');

// WhatsApp
define('WPP_NUMBER', '5561984222205');

// E-mail (configure no Hostinger SMTP)
define('MAIL_FROM', 'noreply@amavsturismo.com.br');
define('MAIL_ADMIN', 'contato@amavsturismo.com.br');

// Segurança
define('SITE_KEY', bin2hex(random_bytes(16))); // mude para uma chave fixa
define('ALLOWED_ORIGINS', ['https://amavsturismo.com.br', 'https://www.amavsturismo.com.br']);

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Erro de conexão com o banco de dados.']));
}

// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
