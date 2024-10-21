<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
session_start();
include 'database.connection.php';

header('Content-Type: application/json');

if (getenv('APP_ENV') === 'development') {
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type');
}
$email = $_POST['email']; // Get the username from the POST request
$password = $_POST['password']; // Get the password from the POST request
echo $email;
echo $password;
$conn = getDatabaseConnection();

// Retrieve the hashed password from the database (for the user logging in)
$stmt = $conn->prepare('SELECT username, password FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->bind_result($userId, $hashedPassword);
$stmt->fetch();

$sql = 'SELECT * FROM Einkaufsliste';

// Verify the password
if (password_verify($password, $hashedPassword)) {
	// Create a session for the user
	$_SESSION['user_id'] = $userId; // Set the user ID (you would get this from the database)

	echo json_encode(['message' => 'Login successful']);

	echo isset($_SESSION['user_id']);
	echo $_SESSION['user_id'];
} else {
	echo json_encode(['error' => 'Invalid username or password']);
}
?>
