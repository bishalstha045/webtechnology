<?php
require 'config.php';
header('Content-Type: application/json');

$search = $_GET['search'] ?? '';

try {
    if ($search) {
        $stmt = $pdo->prepare("
            SELECT 
                id,
                full_name,
                usn,
                email,
                phone,
                gender,
                course,
                dob,
                address,
                profile_image
            FROM students 
            WHERE full_name LIKE ? OR email LIKE ? 
            ORDER BY id DESC
        ");
        $stmt->execute(["%$search%", "%$search%"]);
    } else {
        $stmt = $pdo->query("
            SELECT 
                id,
                full_name,
                usn,
                email,
                phone,
                gender,
                course,
                dob,
                address,
                profile_image
            FROM students 
            ORDER BY id DESC
        ");
    }
    
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $students
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>  