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
            // ✅ DIAGNOSTICS D'UN MÉDECIN
            if (isset($_GET['medecin_id'])) {
                $medecin_id = $_GET['medecin_id'];
                
                $query = "SELECT 
                            d.id,
                            d.date_analyse as date,
                            d.resultat,
                            d.confiance,
                            d.description,
                            d.recommendation,
                            d.image_path as image,
                            d.statut_signature,
                            d.date_signature,
                            d.signature_medecin,
                            d.patient_id,
                            CONCAT(p.prenom, ' ', p.nom) as patient_nom,
                            p.email as patient_email,
                            p.telephone as patient_telephone
                          FROM diagnostics d
                          INNER JOIN users p ON d.patient_id = p.id
                          WHERE d.medecin_id = :medecin_id
                          ORDER BY d.statut_signature ASC, d.date_analyse DESC";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':medecin_id', $medecin_id);
                $stmt->execute();
                
                $diagnostics = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $en_attente = [];
                $signes = [];
                
                foreach ($diagnostics as $diag) {
                    if ($diag['statut_signature'] === 'en_attente') {
                        $en_attente[] = $diag;
                    } else {
                        $signes[] = $diag;
                    }
                }
                
                echo json_encode([
                    'success' => true,
                    'diagnostics' => $diagnostics,
                    'en_attente' => $en_attente,
                    'signes' => $signes,
                    'debug' => [
                        'medecin_id' => $medecin_id,
                        'nb_total' => count($diagnostics),
                        'nb_en_attente' => count($en_attente),
                        'nb_signes' => count($signes)
                    ]
                ]);
                exit;
            }
            
            // ✅ DIAGNOSTICS D'UN PATIENT
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
                            d.statut_signature,
                            d.date_signature,
                            d.signature_medecin,
                            CONCAT('Dr. ', m.prenom, ' ', m.nom) as medecin,
                            m.specialite as medecin_specialite
                          FROM diagnostics d
                          LEFT JOIN users m ON d.medecin_id = m.id
                          WHERE d.patient_id = :patient_id
                          ORDER BY d.date_analyse DESC";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':patient_id', $patient_id);
                $stmt->execute();
                
                echo json_encode([
                    'success' => true,
                    'diagnostics' => $stmt->fetchAll(PDO::FETCH_ASSOC)
                ]);
                exit;
            }
            
            echo json_encode([
                'success' => false, 
                'message' => 'Paramètre manquant (patient_id ou medecin_id)'
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['patient_id'], $data['resultat'])) {
                echo json_encode(['success' => false, 'message' => 'Données incomplètes']);
                break;
            }
            
            $medecin_id = null;
            
            if (isset($data['medecin_id']) && !empty($data['medecin_id'])) {
                $medecin_id = $data['medecin_id'];
            } else {
                $queryMedecin = "SELECT medecin_id FROM users WHERE id = :patient_id LIMIT 1";
                $stmtMedecin = $db->prepare($queryMedecin);
                $stmtMedecin->bindParam(':patient_id', $data['patient_id']);
                $stmtMedecin->execute();
                $patientData = $stmtMedecin->fetch(PDO::FETCH_ASSOC);
                
                if ($patientData && $patientData['medecin_id']) {
                    $medecin_id = $patientData['medecin_id'];
                }
            }
            
            if (!$medecin_id) {
                echo json_encode(['success' => false, 'message' => 'Aucun médecin assigné']);
                break;
            }
            
            $query = "INSERT INTO diagnostics 
                     (patient_id, medecin_id, resultat, confiance, prob_cancer, prob_normal, description, recommendation, risk_level, image_path, date_analyse, statut_signature) 
                     VALUES 
                     (:patient_id, :medecin_id, :resultat, :confiance, :prob_cancer, :prob_normal, :description, :recommendation, :risk_level, :image_path, NOW(), 'en_attente')";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':patient_id', $data['patient_id']);
            $stmt->bindParam(':medecin_id', $medecin_id);
            $stmt->bindParam(':resultat', $data['resultat']);
            $stmt->bindParam(':confiance', $data['confiance']);
            $stmt->bindParam(':prob_cancer', $data['prob_cancer'] ?? null);
            $stmt->bindParam(':prob_normal', $data['prob_normal'] ?? null);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':recommendation', $data['recommendation']);
            $stmt->bindParam(':risk_level', $data['risk_level'] ?? null);
            $stmt->bindParam(':image_path', $data['image_path']);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'diagnostic_id' => $db->lastInsertId(),
                    'medecin_id' => $medecin_id
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erreur insertion']);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                echo json_encode(['success' => false, 'message' => 'ID manquant']);
                break;
            }
            
            if (isset($data['signature_medecin'])) {
                $query = "UPDATE diagnostics 
                         SET signature_medecin = :signature, 
                             date_signature = NOW(), 
                             statut_signature = 'signe'
                         WHERE id = :id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':signature', $data['signature_medecin']);
                $stmt->bindParam(':id', $data['id']);
                
                echo json_encode(['success' => $stmt->execute()]);
                break;
            }
            
            $updateFields = [];
            $params = [':id' => $data['id']];
            
            if (isset($data['description'])) {
                $updateFields[] = 'description = :description';
                $params[':description'] = $data['description'];
            }
            if (isset($data['recommendation'])) {
                $updateFields[] = 'recommendation = :recommendation';
                $params[':recommendation'] = $data['recommendation'];
            }
            if (isset($data['resultat'])) {
                $updateFields[] = 'resultat = :resultat';
                $params[':resultat'] = $data['resultat'];
            }
            if (isset($data['confiance'])) {
                $updateFields[] = 'confiance = :confiance';
                $params[':confiance'] = $data['confiance'];
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'message' => 'Aucun champ']);
                break;
            }
            
            $query = "UPDATE diagnostics SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
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