<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

use Database\EncryptionHandler;

$encryptionHandler = new EncryptionHandler();
$encryptionHandler->encryptCredentials();

$username = $_POST['username'];
$password = $_POST['password'];
$email = $_POST['email'];

$encryptionHandler->storeUser($username, $password, $email);
