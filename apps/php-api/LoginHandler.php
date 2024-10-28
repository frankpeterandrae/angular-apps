<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

namespace Database;

class LoginHandler
{
	private $conn;

	public function __construct()
	{
		$this->conn = DatabaseConnection::getDatabaseConnection();
	}

	public function handleLogin()
	{
		header('Content-Type: application/json');

		if (getenv('APP_ENV') === 'development') {
			header('Access-Control-Allow-Origin: *');
			header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
			header('Access-Control-Allow-Headers: Content-Type');
		}

		$email = $_POST['email'];
		$password = $_POST['password'];

		// Retrieve the hashed password from the database (for the user logging in)
		$stmt = $this->conn->prepare('SELECT username, password FROM users WHERE email = ?');
		$stmt->bind_param('s', $email);
		$stmt->execute();
		$stmt->bind_result($userId, $hashedPassword);
		$stmt->fetch();

		// Verify the password
		if (password_verify($password, $hashedPassword)) {
			// Create a session for the user
			$_SESSION['user_id'] = $userId;

			echo json_encode(['message' => 'Login successful']);
		} else {
			echo json_encode(['error' => 'Invalid username or password']);
		}
	}
}
