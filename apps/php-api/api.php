<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

header('Content-Type: application/json');

// Connect to the database
$servername = "localhost";
$username = "TODO";
$password = "TODO";
$dbname = "TODO";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die(json_encode(['error' => 'Database connection failed']));
}


// Determine if the request is GET or POST
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
// Handle GET requests for fetching data
  $action = $_GET['action']; // Determine the endpoint based on query parameter 'action'
  switch ($action) {
    case 'getData':
      // Perform a query
      $sql = "SELECT * FROM Einkaufsliste";
      $result = $conn->query($sql);
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
        $stmt = $conn->prepare("INSERT INTO Einkaufsliste (Liste, Datum) VALUES (?, ?)");
        $stmt->bind_param("ss", $list, $date);

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
        $stmt = $conn->prepare("DELETE FROM Einkaufsliste WHERE NR = ?");

        if ($stmt === false) {
          echo json_encode(['error' => 'Failed to prepare statement']);
          break;
        }

        $stmt->bind_param("i", $id);

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
