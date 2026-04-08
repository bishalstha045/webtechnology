<?php
require 'config.php';
header('Content-Type: application/json');

$id = $_POST['id'] ?? null;
if (!$id) {
    echo json_encode(['error' => true, 'message' => 'Missing Student ID']);
    exit;
}

$currentUser = $_POST['currentUser'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT full_name FROM students WHERE id = ?");
    $stmt->execute([$id]);
    $student = $stmt->fetch();

    if ($student) {
        $dbName = strtolower(trim($student['full_name'] ?? ''));
        $reqUser = strtolower(trim($currentUser));

        if ($reqUser !== $dbName) {
            echo json_encode(['error' => true, 'message' => 'Unauthorized: You can only update your own data.']);
            exit;
        }
    }
} catch (PDOException $e) {
    echo json_encode(['error' => true, 'message' => 'Database Error: ' . $e->getMessage()]);
    exit;
}

$imagePath = $_POST['existing_image'] ?? '';

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'upload/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $filename = time() . '_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", basename($_FILES['image']['name']));
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
         if ($imagePath && file_exists($imagePath)) {
             @unlink($imagePath);
         }
         $imagePath = $targetPath;
    }
}

try {
    $stmt = $pdo->prepare("UPDATE students SET usn=?, full_name=?, email=?, phone=?, gender=?, course=?, dob=?, address=?, profile_image=? WHERE id=?");
    $stmt->execute([
        $_POST['usn'] ?? '',
        $_POST['name'] ?? '',
        $_POST['email'] ?? '',
        $_POST['phone'] ?? '',
        $_POST['gender'] ?? '',
        $_POST['course'] ?? '',
        $_POST['dob'] ?? '',
        $_POST['address'] ?? '',
        $imagePath,
        $id
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Student updated successfully!']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['error' => true, 'message' => 'Email already exists!']);
    } else {
        echo json_encode(['error' => true, 'message' => 'Database Error: ' . $e->getMessage()]);
    }
}
?>
