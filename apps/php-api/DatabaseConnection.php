<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
namespace Database;
use mysqli;

class DatabaseConnection
{
	public static function getDatabaseConnection()
	{
		// Load the encrypted credentials from the file
		$encrypted_data = file_get_contents('db_encrypted_config.txt');

		// Get the encryption key from an environment variable
		$decryption_key = getenv('ENCRYPTION_KEY');

		if ($decryption_key === false) {
			die(json_encode(['error' => 'Encryption key not set']));
		}

		// Decrypt the credentials
		$decrypted_data = openssl_decrypt($encrypted_data, 'AES-256-CBC', $decryption_key, 0, '1234567812345678');
		$dbConfig = json_decode($decrypted_data, true);

		// Use the decrypted credentials to connect to the database
		$conn = new mysqli($dbConfig['host'], $dbConfig['username'], $dbConfig['password'], $dbConfig['database']);

		if ($conn->connect_error) {
			die(json_encode(['error' => 'Database connection failed']));
		}

		return $conn;
	}
}
