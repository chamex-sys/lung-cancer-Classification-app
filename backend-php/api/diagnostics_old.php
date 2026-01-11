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

// ... reste du code
// lung-cancer-api/api/diagnostics.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            // Récupérer les diagnostics d'un patient
            if (isset($_GET['patient_id'])) {
                $patient_id = $_GET['patient_id'];
                
                $query = "SELECT 
                            d.id,
                            d.date_analyse as date,
                            d.resultat,
                            d.confiance,
                            d.description,
                            d.recommendation,
                            d.image_path as image,
                            CONCAT('Dr. ', u.prenom, ' ', u.nom) as medecin
                          FROM diagnostics d
                          LEFT JOIN users u ON d.medecin_id = u.id
                          WHERE d.patient_id = :patient_id
                          ORDER BY d.date_analyse DESC";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':patient_id', $patient_id);
                $stmt->execute();
                
                $diagnostics = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'diagnostics' => $diagnostics
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID du patient requis'
                ]);
            }
            break;
            
        case 'POST':
            // Créer un nouveau diagnostic
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['patient_id']) || !isset($data['medecin_id']) || !isset($data['resultat'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Données incomplètes'
                ]);
                break;
            }
            
            $query = "INSERT INTO diagnostics 
                     (patient_id, medecin_id, resultat, confiance, description, recommendation, image_path, date_analyse) 
                     VALUES 
                     (:patient_id, :medecin_id, :resultat, :confiance, :description, :recommendation, :image_path, NOW())";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':patient_id', $data['patient_id']);
            $stmt->bindParam(':medecin_id', $data['medecin_id']);
            $stmt->bindParam(':resultat', $data['resultat']);
            $stmt->bindParam(':confiance', $data['confiance']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':recommendation', $data['recommendation']);
            $stmt->bindParam(':image_path', $data['image_path']);
            
            if ($stmt->execute()) {
                $diagnostic_id = $db->lastInsertId();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Diagnostic créé avec succès',
                    'diagnostic_id' => $diagnostic_id
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Erreur lors de la création du diagnostic'
                ]);
            }
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Méthode non supportée'
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>