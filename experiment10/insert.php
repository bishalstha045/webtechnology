<?php
require 'config.php';
header('Content-Type: application/json');

// Image upload handling
$imagePath = '';

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'upload/';

    // Create folder if not exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Clean filename
    $filename = time() . '_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", basename($_FILES['image']['name']));
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $imagePath = $targetPath;
    }
}

try {
    // ✅ FIXED COLUMN NAMES
    $stmt = $pdo->prepare("
        INSERT INTO students 
        (usn, full_name, email, phone, gender, course, dob, address, profile_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $_POST['usn'] ?? '',
        $_POST['name'] ?? '',         // form field name stays same
        $_POST['email'] ?? '',
        $_POST['phone'] ?? '',
        $_POST['gender'] ?? '',
        $_POST['course'] ?? '',
        $_POST['dob'] ?? '',
        $_POST['address'] ?? '',
        $imagePath
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Student registered successfully!'
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode([
            'error' => true,
            'message' => 'Duplicate entry (USN or Email already exists)'
        ]);
    } else {
        echo json_encode([
            'error' => true,
            'message' => 'Database Error: ' . $e->getMessage()
        ]);
    }
}
?>