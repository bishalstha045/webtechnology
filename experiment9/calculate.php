<?php
// API Endpoint for processing mathematical expressions
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['parsedPHP'])) {
    echo json_encode(['error' => true, 'message' => 'No expression provided.']);
    exit;
}

$parsed = $input['parsedPHP'];

// Strict security layer to prevent remote code execution (RCE) via eval:
// Strip all allowed safe mathematical functions and pi/e constants.
$allowed_functions = ['sqrt', 'pow', 'log10', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'abs', 'exp', 'pi', 'rad2deg', 'deg2rad', 'cbrt'];
$test_str = $parsed;
foreach ($allowed_functions as $func) {
    $test_str = str_ireplace($func, '', $test_str);
}

// Check if any characters besides math operators, digits, and parens remain
if (preg_match('/[^0-9\.\+\-\*\/\%\(\)\s\,]/', $test_str)) {
    echo json_encode(['error' => true, 'message' => 'Invalid characters detected.']);
    exit;
}

try {
    if (!function_exists('cbrt')) {
        function cbrt($n) { return $n < 0 ? -pow(abs($n), 1/3) : pow($n, 1/3); }
    }
    
    $result = null;
    // Suppress warnings in case of malformed expressions like "1+" or division by zero
    @eval('$result = (' . $parsed . ');');
    
    if ($result === false || is_null($result) || is_nan($result) || is_infinite($result)) {
        echo json_encode(['error' => true, 'message' => 'Math Error']);
    } else {
        // Return rounded floating point to prevent 0.1+0.2=0.30000000000000004 artifacts
        $formatted_result = floatval(round($result, 10));
        echo json_encode(['error' => false, 'result' => $formatted_result]);
    }
} catch (Throwable $e) {
    echo json_encode(['error' => true, 'message' => 'Evaluation Error']);
}
?>
