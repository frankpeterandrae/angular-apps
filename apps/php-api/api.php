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
// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
	echo json_encode(['error' => 'Unauthorized']);
	exit();
}

$conn = getDatabaseConnection();

// Determine if the request is GET or POST
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
	// Handle GET requests for fetching data
	$action = $_GET['action']; // Determine the endpoint based on query parameter 'action'
	switch ($action) {
		case 'getData':
			// Perform a query
			$stmt = $conn->prepare('SELECT * FROM Einkaufsliste');
			$stmt->bind_param('s', $username);
			$stmt->execute();
			$stmt->bind_result($result);
			$stmt->fetch();

			$data = [];

			if ($result->num_rows > 0) {
				while ($row = $result->fetch_assoc()) {
					$data[] = $row;
				}
			}
			// Return the data as JSON
			echo json_encode($data);
			break;

		default:
			echo json_encode(['error' => 'Invalid GET action: ' . $action]);
			break;
	}
} elseif ($method == 'POST') {
	// Handle POST requests for inserting or updating data
	$action = $_POST['action']; // Determine the endpoint based on the 'action' parameter in POST

	switch ($action) {
		case 'addData':
			$list = $_POST['list'];
			$date = $_POST['date'];
			if (!empty($list) && !empty($date)) {
				$stmt = $conn->prepare('INSERT INTO Einkaufsliste (Liste, Datum) VALUES (?, ?)');
				$stmt->bind_param('ss', $list, $date);

				if ($stmt->execute()) {
					echo json_encode(['success' => 'Data added successfully']);
				} else {
					echo json_encode(['error' => 'Failed to add data']);
				}
			} else {
				echo json_encode(['error' => 'Invalid data']);
			}
			break;
		case 'deleteData':
			$id = $_POST['id'];

			if (!empty($id)) {
				$stmt = $conn->prepare('DELETE FROM Einkaufsliste WHERE NR = ?');

				if ($stmt === false) {
					echo json_encode(['error' => 'Failed to prepare statement']);
					break;
				}

				$stmt->bind_param('i', $id);

				if ($stmt->execute()) {
					echo json_encode(['success' => 'Data deleted successfully']);
				} else {
					echo json_encode(['error' => 'Failed to delete data']);
				}
			} else {
				echo json_encode(['error' => 'Invalid data']);
			}
			break;
		default:
			echo json_encode(['error' => 'Invalid POST action: ' . $action]);
			break;
	}
} else {
	echo json_encode(['error' => 'Invalid request method']);
}

// Close the connection
$conn->close();
?>
