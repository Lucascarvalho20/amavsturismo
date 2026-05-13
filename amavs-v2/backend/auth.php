<?php
// AMAVS — Autenticação do painel admin (produção)
require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = htmlspecialchars(trim($input['username'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(422);
        die(json_encode(['error' => 'Usuário e senha são obrigatórios.']));
    }

    $stmt = $pdo->prepare("SELECT id, name, username, password_hash, role, status FROM admin_users WHERE username = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        // Log tentativa falha
        $pdo->prepare("INSERT INTO auth_log (username,ip,success,ts) VALUES (?,?,0,NOW())")->execute([$username, $_SERVER['REMOTE_ADDR']]);
        die(json_encode(['error' => 'Usuário ou senha incorretos.']));
    }

    // Atualiza último acesso
    $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);
    $pdo->prepare("INSERT INTO auth_log (username,ip,success,ts) VALUES (?,?,1,NOW())")->execute([$username, $_SERVER['REMOTE_ADDR']]);

    $_SESSION['admin_id']   = $user['id'];
    $_SESSION['admin_user'] = $user['username'];
    $_SESSION['admin_role'] = $user['role'];
    $_SESSION['admin_ts']   = time();

    echo json_encode(['ok' => true, 'user' => $user['username'], 'role' => $user['role'], 'name' => $user['name']]);

} elseif ($method === 'DELETE') {
    // Logout
    session_destroy();
    echo json_encode(['ok' => true]);

} elseif ($method === 'GET') {
    // Verifica sessão
    if (!empty($_SESSION['admin_id']) && (time() - $_SESSION['admin_ts']) < 28800) {
        echo json_encode(['ok' => true, 'user' => $_SESSION['admin_user'], 'role' => $_SESSION['admin_role']]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Sessão expirada.']);
    }
}
