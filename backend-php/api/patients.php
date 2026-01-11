<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            // UN PATIENT UNIQUE
            if (isset($_GET['id'])) {
                $patient_id = $_GET['id'];
                
                $query = "SELECT 
                            p.id,
                            p.nom,
                            p.prenom,
                            p.email,
                            p.telephone,
                            p.medecin_id,
                            CONCAT('Dr. ', m.prenom, ' ', m.nom) as medecin_nom,
                            m.specialite as medecin_specialite
                          FROM users p
                          LEFT JOIN users m ON p.medecin_id = m.id
                          WHERE p.id = :patient_id AND p.role = 'patient'
                          LIMIT 1";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':patient_id', $patient_id);
                $stmt->execute();
                
                $patient = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'patient' => $patient
                ]);
                break;
            }
            
            // PATIENTS D'UN MÉDECIN
            if (isset($_GET['medecin_id'])) {
                $medecin_id = $_GET['medecin_id'];
                
                $query = "SELECT 
                            u.id,
                            u.nom,
                            u.prenom,
                            u.email,
                            u.telephone,
                            u.medecin_id,
                            CONCAT('Dr. ', m.prenom, ' ', m.nom) as medecin_nom,
                            m.specialite as medecin_specialite,
                            COUNT(d.id) as nb_diagnostics,
                            MAX(d.date_analyse) as derniere_analyse
                          FROM users u
                          LEFT JOIN users m ON u.medecin_id = m.id
                          LEFT JOIN diagnostics d ON u.id = d.patient_id
                          WHERE u.role = 'patient' AND u.medecin_id = :medecin_id
                          GROUP BY u.id
                          ORDER BY derniere_analyse DESC";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':medecin_id', $medecin_id);
                $stmt->execute();
                
                echo json_encode([
                    'success' => true,
                    'patients' => $stmt->fetchAll(PDO::FETCH_ASSOC)
                ]);
                break;
            }
            
            echo json_encode(['success' => false, 'message' => 'Paramètre manquant']);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['patient_id'], $data['medecin_id'])) {
                echo json_encode(['success' => false, 'message' => 'Données manquantes']);
                break;
            }
            
            $query = "UPDATE users 
                     SET medecin_id = :medecin_id,
                         medecin_nom = (SELECT CONCAT('Dr. ', prenom, ' ', nom) FROM users WHERE id = :medecin_id2 LIMIT 1),
                         medecin_specialite = (SELECT specialite FROM users WHERE id = :medecin_id3 LIMIT 1)
                     WHERE id = :patient_id AND role = 'patient'";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':patient_id', $data['patient_id']);
            $stmt->bindParam(':medecin_id', $data['medecin_id']);
            $stmt->bindParam(':medecin_id2', $data['medecin_id']);
            $stmt->bindParam(':medecin_id3', $data['medecin_id']);
            
            echo json_encode(['success' => $stmt->execute()]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Méthode non supportée']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>