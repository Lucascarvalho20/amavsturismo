<?php
// AMAVS — Recebe orçamentos do formulário
require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); die(json_encode(['error'=>'Método não permitido.'])); }

// Sanitize input
function clean($v) { return htmlspecialchars(strip_tags(trim($v ?? '')), ENT_QUOTES, 'UTF-8'); }

$data = [
    'code'       => 'QT' . strtoupper(bin2hex(random_bytes(4))),
    'nome'       => clean($_POST['nome'] ?? ''),
    'empresa'    => clean($_POST['empresa'] ?? ''),
    'telefone'   => preg_replace('/\D/', '', $_POST['telefone'] ?? ''),
    'email'      => filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL),
    'origem'     => clean($_POST['origem'] ?? ''),
    'destino'    => clean($_POST['destino'] ?? ''),
    'data_ida'   => clean($_POST['data_ida'] ?? ''),
    'data_volta' => clean($_POST['data_volta'] ?? ''),
    'passageiros'=> (int)($_POST['passageiros'] ?? 0),
    'tipo'       => clean($_POST['tipo_viagem'] ?? ''),
    'canal'      => clean($_POST['canal'] ?? 'whatsapp'),
    'obs'        => clean($_POST['observacoes'] ?? ''),
    'status'     => 'pending',
    'ip'         => $_SERVER['REMOTE_ADDR'],
    'created_at' => date('Y-m-d H:i:s'),
];

if (!$data['nome'] || !$data['telefone'] || !$data['origem'] || !$data['destino']) {
    http_response_code(422);
    die(json_encode(['error' => 'Campos obrigatórios faltando.']));
}

try {
    $stmt = $pdo->prepare("INSERT INTO orcamentos (code,nome,empresa,telefone,email,origem,destino,data_ida,data_volta,passageiros,tipo_viagem,canal,observacoes,status,ip,created_at) VALUES (:code,:nome,:empresa,:telefone,:email,:origem,:destino,:data_ida,:data_volta,:passageiros,:tipo,:canal,:obs,:status,:ip,:created_at)");
    $stmt->execute($data);

    // Monta mensagem WhatsApp
    $msg = "🚌 *Novo Orçamento AMAVS*\n\n";
    $msg .= "*Código:* {$data['code']}\n";
    $msg .= "*Nome:* {$data['nome']}\n";
    $msg .= "*Tel:* {$data['telefone']}\n";
    $msg .= "*Empresa:* " . ($data['empresa'] ?: '—') . "\n";
    $msg .= "*Origem:* {$data['origem']}\n";
    $msg .= "*Destino:* {$data['destino']}\n";
    $msg .= "*Data ida:* {$data['data_ida']}\n";
    $msg .= "*Passageiros:* {$data['passageiros']}\n";
    $msg .= "*Obs:* " . ($data['obs'] ?: '—');

    echo json_encode([
        'ok'   => true,
        'code' => $data['code'],
        'wpp'  => 'https://wa.me/' . WPP_NUMBER . '?text=' . rawurlencode($msg),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar orçamento.']);
}
