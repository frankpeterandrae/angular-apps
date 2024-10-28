<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

namespace Database;

class ApiHandler
{
	private $conn;
	private $strInvalideData = 'Invalid data';

	public function __construct()
	{
		$this->conn = DatabaseConnection::getDatabaseConnection();
	}

	public function handleRequest()
	{
		header('Content-Type: application/json');

		if (getenv('APP_ENV') === 'development') {
			header('Access-Control-Allow-Origin: *');
			header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
			header('Access-Control-Allow-Headers: Content-Type');
		}

		if (!isset($_SESSION['user_id'])) {
			echo json_encode(['error' => 'Unauthorized']);
			exit();
		}

		$method = $_SERVER['REQUEST_METHOD'];

		if ($method == 'GET') {
			$this->handleGet();
		} elseif ($method == 'POST') {
			$this->handlePost();
		} else {
			echo json_encode(['error' => 'Invalid request method']);
		}

		$this->conn->close();
	}

	private function handleGet()
	{
		$action = $_GET['action'];
		switch ($action) {
			case 'getData':
				$this->getData();
				break;
			case 'getSingleData':
				$this->getSingleData();
				break;
			default:
				echo json_encode(['error' => 'Invalid GET action: ' . $action]);
				break;
		}
	}

	private function handlePost()
	{
		$action = $_POST['action'];
		switch ($action) {
			case 'addData':
				$this->addData();
				break;
			case 'deleteData':
				$this->deleteData();
				break;
			default:
				echo json_encode(['error' => 'Invalid POST action: ' . $action]);
				break;
		}
	}

	private function getData()
	{
		$stmt = $this->conn->prepare('SELECT * FROM Einkaufsliste');
		$stmt->execute();
		$result = $stmt->get_result();
		$data = [];

		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$data[] = $row;
			}
		}
		echo json_encode($data);
	}

	private function getSingleData()
	{
		$id = $_GET['id'];
		if (!empty($id)) {
			$stmt = $this->conn->prepare('SELECT * FROM Einkaufsliste WHERE NR = ?');
			$stmt->bind_param('i', $id);
			$stmt->execute();
			$result = $stmt->get_result();
			$data = $result->fetch_assoc();
			echo json_encode($data);
		} else {
			echo json_encode(['error' => $this->strInvalideData]);
		}
	}

	private function addData()
	{
		$list = $_POST['list'];
		$date = $_POST['date'];
		if (!empty($list) && !empty($date)) {
			$stmt = $this->conn->prepare('INSERT INTO Einkaufsliste (Liste, Datum) VALUES (?, ?)');
			$stmt->bind_param('ss', $list, $date);

			if ($stmt->execute()) {
				echo json_encode(['success' => 'Data added successfully']);
			} else {
				echo json_encode(['error' => 'Failed to add data']);
			}
		} else {
			echo json_encode(['error' => $this->strInvalideData]);
		}
	}

	private function deleteData()
	{
		$id = $_POST['id'];
		if (!empty($id)) {
			$stmt = $this->conn->prepare('DELETE FROM Einkaufsliste WHERE NR = ?');
			if ($stmt === false) {
				echo json_encode(['error' => 'Failed to prepare statement']);
				return;
			}
			$stmt->bind_param('i', $id);
			if ($stmt->execute()) {
				echo json_encode(['success' => 'Data deleted successfully']);
			} else {
				echo json_encode(['error' => 'Failed to delete data']);
			}
		} else {
			echo json_encode(['error' => $this->strInvalideData]);
		}
	}
}
