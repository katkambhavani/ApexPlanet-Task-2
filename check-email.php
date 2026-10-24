
<?php
header('Content-Type: application/json');

$email = $_GET['email'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Email format is valid.'
]);

