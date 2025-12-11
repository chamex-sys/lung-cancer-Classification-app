<?php
// C:\xampp\htdocs\lung-cancer-api\api\login.php

// ⚠️ HEADERS CORS - PORT 5180
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: http://localhost:5180");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json; charset=UTF-8");
}

// Gérer la requête OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
    exit();
}

// Lire les données JSON
$input = file_get_contents("php://input");
$data = json_decode($input);

// Debug
error_log("=== LOGIN DEBUG ===");
error_log("Input: " . $input);

// Vérification des données
if (empty($data) || empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email et mot de passe requis"]);
    exit();
}

// Connexion à la base de données
try {
    require_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    // Rechercher l'utilisateur
    $query = "SELECT id, nom, prenom, email, password, telephone, specialite, role, photo_profil FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->email]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect"]);
        exit();
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Vérifier le mot de passe
    if (!password_verify($data->password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect"]);
        exit();
    }
    
    // Succès - Ne pas renvoyer le mot de passe
    unset($user['password']);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Connexion réussie",
        "user" => $user
    ]);
    
} catch (Exception $e) {
    error_log("ERREUR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur serveur: " . $e->getMessage()]);
}
?>