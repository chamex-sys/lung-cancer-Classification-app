<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Gérer la requête OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->email) || !isset($data->password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Email et mot de passe requis'
        ]);
        exit;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Vérifier si l'email existe déjà
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Cet email est déjà utilisé'
            ]);
            exit;
        }
        
        // Récupérer les infos du médecin si c'est un patient
        $medecin_nom = null;
        $medecin_specialite = null;
        
        if ($data->role === 'patient' && isset($data->medecin_id) && $data->medecin_id) {
            $query_med = "SELECT CONCAT('Dr. ', prenom, ' ', nom) as nom, specialite 
                          FROM users 
                          WHERE id = :medecin_id AND role = 'medecin'";
            $stmt_med = $db->prepare($query_med);
            $stmt_med->bindParam(':medecin_id', $data->medecin_id);
            $stmt_med->execute();
            
            if ($stmt_med->rowCount() > 0) {
                $medecin_info = $stmt_med->fetch(PDO::FETCH_ASSOC);
                $medecin_nom = $medecin_info['nom'];
                $medecin_specialite = $medecin_info['specialite'];
            }
        }
        
        // Hash du mot de passe
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        
        // Requête d'insertion
        $query = "INSERT INTO users 
                  (nom, prenom, email, password, telephone, specialite, role, medecin_id, medecin_nom, medecin_specialite, date_creation) 
                  VALUES 
                  (:nom, :prenom, :email, :password, :telephone, :specialite, :role, :medecin_id, :medecin_nom, :medecin_specialite, NOW())";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nom', $data->nom);
        $stmt->bindParam(':prenom', $data->prenom);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':telephone', $data->telephone);
        $stmt->bindParam(':specialite', $data->specialite);
        $stmt->bindParam(':role', $data->role);
        
        $medecin_id_value = ($data->role === 'patient' && isset($data->medecin_id)) ? $data->medecin_id : null;
        $stmt->bindParam(':medecin_id', $medecin_id_value);
        $stmt->bindParam(':medecin_nom', $medecin_nom);
        $stmt->bindParam(':medecin_specialite', $medecin_specialite);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Inscription réussie'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
}
?>