<?php
// C:\xampp\htdocs\lung-cancer-api\api\register.php

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
error_log("=== REGISTER DEBUG ===");
error_log("Input: " . $input);

// Vérification des données
if (empty($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Aucune donnée reçue"]);
    exit();
}

if (empty($data->nom) || empty($data->prenom) || empty($data->email) || empty($data->password) || empty($data->telephone)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Tous les champs obligatoires doivent être remplis"]);
    exit();
}

// Connexion à la base de données
try {
    require_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    // Vérifier si l'email existe déjà
    $checkQuery = "SELECT id FROM users WHERE email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$data->email]);
    
    if ($checkStmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Cet email est déjà utilisé"]);
        exit();
    }
    
    // Préparer les données
    $nom = htmlspecialchars(strip_tags($data->nom));
    $prenom = htmlspecialchars(strip_tags($data->prenom));
    $email = htmlspecialchars(strip_tags($data->email));
    $telephone = htmlspecialchars(strip_tags($data->telephone));
    $specialite = isset($data->specialite) ? htmlspecialchars(strip_tags($data->specialite)) : '';
    $role = isset($data->role) ? htmlspecialchars(strip_tags($data->role)) : 'medecin';
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    
    // Insertion
    $insertQuery = "INSERT INTO users (nom, prenom, email, password, telephone, specialite, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $insertStmt = $db->prepare($insertQuery);
    
    if ($insertStmt->execute([$nom, $prenom, $email, $password, $telephone, $specialite, $role])) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Inscription réussie ! Vous pouvez maintenant vous connecter",
            "user_id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur lors de l'insertion en base de données"]);
    }
    
} catch (Exception $e) {
    error_log("ERREUR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur serveur: " . $e->getMessage()]);
}
?>