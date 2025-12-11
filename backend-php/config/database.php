<?php
// C:\xampp\htdocs\lung-cancer-api\config\database.php

// Headers CORS pour permettre les requêtes depuis React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Si c'est une requête OPTIONS (preflight), on retourne immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de la base de données
class Database {
    private $host = "localhost";
    private $db_name = "lung_cancer_db";
    private $username = "root";
    private $password = "";
    private $conn;

    // Méthode de connexion
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo json_encode([
                "success" => false,
                "message" => "Erreur de connexion à la base de données: " . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>