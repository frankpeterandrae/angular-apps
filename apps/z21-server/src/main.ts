/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Bootstrap } from './bootstrap/bootstrap';
import { ProviderFactory } from './bootstrap/providers';

const providers = new ProviderFactory().create();

const app = new Bootstrap(providers).start();

process.on('SIGINT', () => app.stop());

process.on('SIGTERM', () => app.stop());
