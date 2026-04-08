<?php
// config.php
error_reporting(0); // Ensure no HTML error warnings break the JSON response API

$host = 'sql208.infinityfree.com';
$db   = 'if0_41611342_studentmanagement';
$user = 'if0_41611342';
$pass = '1s9H6fMGJJqf'; // Default XAMPP password is empty

try {
    $pdo = @new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-patch the database to include USN and correct names
    try {
        $pdo->exec("ALTER TABLE students ADD COLUMN usn VARCHAR(50) AFTER id");
    } catch (PDOException $ex) {}
    try {
        $pdo->exec("ALTER TABLE students CHANGE name full_name VARCHAR(100) NOT NULL");
    } catch (PDOException $ex) {}
    try {
        $pdo->exec("ALTER TABLE students CHANGE image profile_image VARCHAR(255)");
    } catch (PDOException $ex) {}
} catch (\PDOException $e) {
    // If DB doesn't exist, we send a JSON error instead of crashing HTML
    // You should run database.sql in phpMyAdmin first!
    if (!isset($suppress_db_error)) {
        header('Content-Type: application/json');
        echo json_encode(['error' => true, 'message' => 'Database connection failed. Please run database.sql in PHPMyAdmin first.']);
        exit;
    }
}
