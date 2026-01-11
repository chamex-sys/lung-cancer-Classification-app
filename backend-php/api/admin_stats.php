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
// lung-cancer-api/api/admin_stats.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Récupérer tous les médecins avec leurs statistiques
    $query = "SELECT 
                u.id,
                u.nom,
                u.prenom,
                u.email,
                u.telephone,
                u.specialite,
                COUNT(DISTINCT p.id) as nb_patients,
                COUNT(d.id) as nb_diagnostics,
                SUM(CASE WHEN d.resultat = 'Cancer' THEN 1 ELSE 0 END) as nb_cancer,
                SUM(CASE WHEN d.resultat = 'Normal' THEN 1 ELSE 0 END) as nb_normal
              FROM users u
              LEFT JOIN users p ON p.medecin_id = u.id AND p.role = 'patient'
              LEFT JOIN diagnostics d ON d.medecin_id = u.id
              WHERE u.role = 'medecin'
              GROUP BY u.id
              ORDER BY nb_patients DESC, u.nom, u.prenom";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $medecins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Pour chaque médecin, récupérer ses patients
    foreach ($medecins as &$medecin) {
        $query_patients = "SELECT 
                            u.id,
                            u.nom,
                            u.prenom,
                            u.email,
                            COUNT(d.id) as nb_analyses,
                            (SELECT resultat FROM diagnostics WHERE patient_id = u.id ORDER BY date_analyse DESC LIMIT 1) as dernier_resultat
                          FROM users u
                          LEFT JOIN diagnostics d ON u.id = d.patient_id
                          WHERE u.medecin_id = :medecin_id AND u.role = 'patient'
                          GROUP BY u.id
                          ORDER BY u.nom, u.prenom";
        
        $stmt_patients = $db->prepare($query_patients);
        $stmt_patients->bindParam(':medecin_id', $medecin['id']);
        $stmt_patients->execute();
        
        $medecin['patients'] = $stmt_patients->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Calculer les statistiques globales
    $query_global = "SELECT 
                      (SELECT COUNT(*) FROM users WHERE role = 'medecin') as total_medecins,
                      (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
                      (SELECT COUNT(*) FROM diagnostics) as total_diagnostics,
                      (SELECT COUNT(*) FROM diagnostics WHERE resultat = 'Cancer') as diagnostics_cancer,
                      (SELECT COUNT(*) FROM diagnostics WHERE resultat = 'Normal') as diagnostics_normal";
    
    $stmt_global = $db->prepare($query_global);
    $stmt_global->execute();
    $global_stats = $stmt_global->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'medecins' => $medecins,
        'global_stats' => [
            'totalMedecins' => (int)$global_stats['total_medecins'],
            'totalPatients' => (int)$global_stats['total_patients'],
            'totalDiagnostics' => (int)$global_stats['total_diagnostics'],
            'diagnosticsCancer' => (int)$global_stats['diagnostics_cancer'],
            'diagnosticsNormal' => (int)$global_stats['diagnostics_normal']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>