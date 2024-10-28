<?php
/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
session_start();

use Database\ApiHandler;

$apiHandler = new ApiHandler();
$apiHandler->handleRequest();
