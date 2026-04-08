<?php
require 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$currentUser = $data['currentUser'] ?? '';

if (!$id) {
    echo json_encode(['error' => true, 'message' => 'Invalid ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT full_name, profile_image FROM students WHERE id = ?");
    $stmt->execute([$id]);
    $student = $stmt->fetch();
    
    if (!$student) {
        echo json_encode(['error' => true, 'message' => 'Student not found']);
        exit;
    }

    $dbName = strtolower(trim($student['full_name'] ?? ''));
    $reqUser = strtolower(trim($currentUser));

    if ($reqUser !== $dbName) {
        echo json_encode(['error' => true, 'message' => 'Unauthorized: You can only delete your own data.']);
        exit;
    }
    
    if (!empty($student['profile_image']) && file_exists($student['profile_image'])) {
        @unlink($student['profile_image']);
    }

    $delStmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
    $delStmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Student record deleted successfully!']);
} catch (PDOException $e) {
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
}
?>
