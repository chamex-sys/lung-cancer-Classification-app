-- database.sql
-- Créer la base de données
CREATE DATABASE IF NOT EXISTS lung_cancer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lung_cancer_db;

-- Table des utilisateurs (médecins, patients, admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    role ENUM('medecin', 'patient', 'admin') NOT NULL DEFAULT 'patient',
    specialite VARCHAR(100),
    medecin_id INT NULL,
    medecin_nom VARCHAR(255) NULL,
    medecin_specialite VARCHAR(100) NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_medecin_id (medecin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des diagnostics
CREATE TABLE IF NOT EXISTS diagnostics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medecin_id INT NOT NULL,
    resultat VARCHAR(255) NOT NULL,
    confiance DECIMAL(5,2) NOT NULL,
    description TEXT,
    recommendation TEXT,
    image_path VARCHAR(500),
    date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_cours', 'termine', 'valide') DEFAULT 'termine',
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_medecin_id (medecin_id),
    INDEX idx_date_analyse (date_analyse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des rapports médicaux
CREATE TABLE IF NOT EXISTS rapports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnostic_id INT NOT NULL,
    format ENUM('pdf', 'word', 'html') NOT NULL DEFAULT 'pdf',
    chemin_fichier VARCHAR(500),
    langue ENUM('fr', 'en', 'ar') DEFAULT 'fr',
    date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signature_electronique TEXT,
    FOREIGN KEY (diagnostic_id) REFERENCES diagnostics(id) ON DELETE CASCADE,
    INDEX idx_diagnostic_id (diagnostic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des images de scan
CREATE TABLE IF NOT EXISTS images_scan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnostic_id INT NOT NULL,
    chemin_original VARCHAR(500) NOT NULL,
    chemin_pretraite VARCHAR(500),
    taille_fichier INT,
    format_image VARCHAR(50),
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnostic_id) REFERENCES diagnostics(id) ON DELETE CASCADE,
    INDEX idx_diagnostic_id (diagnostic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS logs_activite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date_action (date_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données de test
-- Médecins
INSERT INTO users (nom, prenom, email, password, telephone, role, specialite) VALUES
('Alaoui', 'Hassan', 'dr.alaoui@medicare.ma', '$2y$10$example_hash_1', '+212 6 11 22 33 44', 'medecin', 'Pneumologie'),
('Benkirane', 'Samira', 'dr.benkirane@medicare.ma', '$2y$10$example_hash_2', '+212 6 22 33 44 55', 'medecin', 'Oncologie'),
('Chraibi', 'Mohamed', 'dr.chraibi@medicare.ma', '$2y$10$example_hash_3', '+212 6 33 44 55 66', 'medecin', 'Radiologie');

-- Patients (assignés à des médecins)
INSERT INTO users (nom, prenom, email, password, telephone, role, medecin_id, medecin_nom, medecin_specialite) VALUES
('Alami', 'Fatima', 'fatima.alami@email.com', '$2y$10$example_hash_4', '+212 6 12 34 56 78', 'patient', 1, 'Dr. Hassan Alaoui', 'Pneumologie'),
('Benali', 'Karim', 'karim.benali@email.com', '$2y$10$example_hash_5', '+212 6 23 45 67 89', 'patient', 1, 'Dr. Hassan Alaoui', 'Pneumologie'),
('Chakir', 'Amina', 'amina.chakir@email.com', '$2y$10$example_hash_6', '+212 6 34 56 78 90', 'patient', 2, 'Dr. Samira Benkirane', 'Oncologie');

-- Diagnostics de test
INSERT INTO diagnostics (patient_id, medecin_id, resultat, confiance, description, recommendation, image_path) VALUES
(4, 1, 'Normal', 95.8, 'Aucune anomalie détectée sur le scan pulmonaire', 'Suivi de routine dans 6 mois', '/uploads/scan_001.jpg'),
(4, 1, 'Normal', 92.3, 'Scan pulmonaire normal, poumons clairs', 'Maintenir le suivi régulier', '/uploads/scan_002.jpg'),
(5, 1, 'Carcinome épidermoïde', 87.5, 'Présence suspectée de carcinome épidermoïde au lobe supérieur droit', 'Consultation oncologique urgente recommandée', '/uploads/scan_003.jpg'),
(6, 2, 'Anomalie bénigne', 78.5, 'Petite opacité détectée - surveillance recommandée', 'Nouvelle analyse dans 1 mois', '/uploads/scan_004.jpg');

-- Vue pour statistiques médecin
CREATE OR REPLACE VIEW vue_stats_medecin AS
SELECT 
    m.id as medecin_id,
    CONCAT(m.prenom, ' ', m.nom) as medecin_nom,
    COUNT(DISTINCT p.id) as nb_patients,
    COUNT(d.id) as nb_analyses,
    SUM(CASE WHEN d.resultat = 'Normal' THEN 1 ELSE 0 END) as nb_normaux,
    SUM(CASE WHEN d.resultat != 'Normal' THEN 1 ELSE 0 END) as nb_anomalies
FROM users m
LEFT JOIN users p ON m.id = p.medecin_id AND p.role = 'patient'
LEFT JOIN diagnostics d ON p.id = d.patient_id
WHERE m.role = 'medecin'
GROUP BY m.id;

-- Vue pour statistiques patient
CREATE OR REPLACE VIEW vue_stats_patient AS
SELECT 
    p.id as patient_id,
    CONCAT(p.prenom, ' ', p.nom) as patient_nom,
    p.medecin_nom,
    COUNT(d.id) as nb_analyses,
    MAX(d.date_analyse) as derniere_analyse,
    SUM(CASE WHEN d.resultat = 'Normal' THEN 1 ELSE 0 END) as nb_normaux,
    SUM(CASE WHEN d.resultat != 'Normal' THEN 1 ELSE 0 END) as nb_anomalies
FROM users p
LEFT JOIN diagnostics d ON p.id = d.patient_id
WHERE p.role = 'patient'
GROUP BY p.id;

-- Procédure stockée pour assigner un médecin
DELIMITER //
CREATE PROCEDURE sp_assigner_medecin(
    IN p_patient_id INT,
    IN p_medecin_id INT
)
BEGIN
    DECLARE medecin_info VARCHAR(255);
    DECLARE medecin_spec VARCHAR(100);
    
    -- Récupérer les infos du médecin
    SELECT CONCAT('Dr. ', prenom, ' ', nom), specialite
    INTO medecin_info, medecin_spec
    FROM users
    WHERE id = p_medecin_id AND role = 'medecin';
    
    -- Mettre à jour le patient
    UPDATE users
    SET medecin_id = p_medecin_id,
        medecin_nom = medecin_info,
        medecin_specialite = medecin_spec
    WHERE id = p_patient_id AND role = 'patient';
END //
DELIMITER ;

-- Trigger pour logger les actions
DELIMITER //
CREATE TRIGGER trg_log_diagnostic_insert
AFTER INSERT ON diagnostics
FOR EACH ROW
BEGIN
    INSERT INTO logs_activite (user_id, action, details)
    VALUES (NEW.medecin_id, 'NOUVEAU_DIAGNOSTIC', 
            CONCAT('Diagnostic créé pour patient ID: ', NEW.patient_id, ' - Résultat: ', NEW.resultat));
END //
DELIMITER ;

-- Afficher les données
SELECT '=== MÉDECINS ===' as Info;
SELECT id, CONCAT(prenom, ' ', nom) as nom_complet, email, specialite FROM users WHERE role = 'medecin';

SELECT '=== PATIENTS ===' as Info;
SELECT id, CONCAT(prenom, ' ', nom) as nom_complet, email, medecin_nom FROM users WHERE role = 'patient';

SELECT '=== DIAGNOSTICS ===' as Info;
SELECT d.id, CONCAT(p.prenom, ' ', p.nom) as patient, d.resultat, d.confiance, d.date_analyse 
FROM diagnostics d
JOIN users p ON d.patient_id = p.id;