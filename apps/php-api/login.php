<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

session_start();

use Database\LoginHandler;

$loginHandler = new LoginHandler();
$loginHandler->handleLogin();
