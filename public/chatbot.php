<?php
// public/chatbot.php
// Simple proxy PHP pour endpoint chatbot — compatible avec Apache
// Lire JSON POST body

header('Content-Type: application/json; charset=utf-8');

// Basic CORS (si nécessaire, adapter en prod)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}

$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request']);
    exit;
}

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$question = $data['question'] ?? null;
$session_token = $data['session_token'] ?? null;

if (!$question) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing question']);
    exit;
}

// Récupérer la clé depuis une variable d'environnement (à définir dans Apache env ou .htaccess)
$apiKey = getenv('OPENAI_API_KEY') ?: (getenv('LOCAL_APP_API_KEY') ?: null);
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

// Construire payload pour OpenAI Chat Completions (modèle GPT-3.5/4 selon disponibilité)
$payload = [
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        ['role' => 'system', 'content' => "You are a helpful assistant for Hôtel Le Pays. Answer politely in French and provide booking links when relevant."],
        ['role' => 'user', 'content' => $question]
    ],
    'max_tokens' => 500,
    'temperature' => 0.2,
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$err = curl_error($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . $err]);
    exit;
}

if ($httpcode >= 400) {
    http_response_code($httpcode);
    echo $response;
    exit;
}

$respJson = json_decode($response, true);
if (isset($respJson['choices'][0]['message']['content'])) {
    $text = $respJson['choices'][0]['message']['content'];
    echo json_encode(['response' => $text]);
    exit;
}

// Fallback
http_response_code(500);
echo json_encode(['error' => 'Unexpected response from upstream']);

// EOF (no closing PHP tag to avoid accidental output)
