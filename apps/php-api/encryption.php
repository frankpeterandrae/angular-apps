<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
include 'database.connection.php';
header('Content-Type: application/json');

if (getenv('APP_ENV') === 'development') {
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type');
}

$encryption_file = json_decode(file_get_contents('D:\dev\dbpassword\encryption_key.json'), true);

$encrypted_credentials = openssl_encrypt(
	json_encode($encryption_file['credentials']),
	'AES-256-CBC',
	$encryption_file['encryption_key'],
	0,
	'1234567812345678'
);

file_put_contents('db_encrypted_config.txt', $encrypted_credentials);

$conn = getDatabaseConnection();

// Get the password from the user's input

$username = $_POST['username'];
$password = $_POST['password'];
$email = $_POST['email'];

// Hash the password using the bcrypt algorithm
$hashedPassword = password_hash($password, PASSWORD_ARGON2I);

// Store $hashedPassword in the MySQL database
// Example SQL query (use prepared statements for security)
$stmt = $conn->prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $username, $hashedPassword, $email);
$stmt->execute();

?>
