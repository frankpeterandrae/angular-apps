/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import http from 'node:http';
import path from 'node:path';

import { CommandStationInfo, LocoManager } from '@application-platform/domain';
import type { ServerToClient } from '@application-platform/protocol';
import { StaticFileServer, WsServer } from '@application-platform/server-utils';
import {
	LanXCommandResolver,
	LanXDecoder,
	LocoEncoder,
	ProgrammingEncoder,
	SystemEncoder,
	SystemInfoDecoder,
	SystemStateDecoder,
	TurnoutEncoder,
	Z21Codec,
	Z21CommandService,
	Z21DatasetEventMapper,
	Z21Udp
} from '@application-platform/z21';
import { createConsoleLogger, type Logger, type ServerConfig } from '@application-platform/z21-shared';

import { Z21EventHandler } from '../handler/z21-event-handler';
import { ServerConfigLoader } from '../infra/config/server-config-loader';
import { AppWsServer } from '../infra/ws/app-websocket-server';
import { CommandStationInfoOrchestrator } from '../services/command-station-info-orchestrator';
import { CvProgrammingService } from '../services/cv-programming-service';

export type Providers = {
	cfg: ServerConfig;
	logger: Logger;
	httpServer: http.Server;
	wsServer: AppWsServer;
	udp: Z21Udp;
	commandStationInfo: CommandStationInfo;
	z21CommandService: Z21CommandService;
	csInfoOrchestrator: CommandStationInfoOrchestrator;
	locoManager: LocoManager;
	z21EventHandler: Z21EventHandler;
	cvProgrammingService: CvProgrammingService;
};

const CV_PROGRAMMING_TIMEOUT_MS = 5000;
/**
 * Creates the application dependency graph.
 */
export class ProviderFactory {
	constructor(private readonly configLoader = new ServerConfigLoader()) {}

	/**
	 * Creates all application providers.
	 *
	 * @param configOverride - Optional configuration used instead of loading it from disk.
	 * @returns Fully initialized application providers.
	 */
	public create(configOverride?: ServerConfig): Providers {
		const cfg = configOverride ?? this.configLoader.load();

		const logger = this.createLogger(cfg);

		const { httpServer, wsServer } = this.createServerInfrastructure(logger);

		const { udp, codec, z21CommandService } = this.createZ21Infrastructure(cfg, logger);

		const commandStationInfo = new CommandStationInfo();

		const locoManager = new LocoManager();

		const csInfoOrchestrator = new CommandStationInfoOrchestrator(commandStationInfo, z21CommandService);

		const cvProgrammingService = new CvProgrammingService(z21CommandService, CV_PROGRAMMING_TIMEOUT_MS);

		const z21EventHandler = this.createZ21EventHandler({
			wsServer,
			logger,
			codec,
			locoManager,
			commandStationInfo,
			csInfoOrchestrator,
			cvProgrammingService
		});

		return {
			cfg,
			logger,
			httpServer,
			wsServer,
			udp,
			commandStationInfo,
			z21CommandService,
			csInfoOrchestrator,
			locoManager,
			z21EventHandler,
			cvProgrammingService
		};
	}

	private createLogger(cfg: ServerConfig): Logger {
		return createConsoleLogger({
			level: cfg.dev?.logLevel ?? 'debug',
			pretty: cfg.dev?.pretty ?? true,
			context: {
				app: 'server'
			}
		});
	}

	private createServerInfrastructure(logger: Logger): {
		httpServer: http.Server;
		wsServer: AppWsServer;
	} {
		const publicDir = path.resolve(process.cwd(), 'public');

		const staticFileServer = new StaticFileServer(publicDir);

		const httpServer = http.createServer(staticFileServer.handle);

		const wsServer = new AppWsServer(
			new WsServer(httpServer),
			logger.child({
				component: 'ws.server'
			})
		);

		return {
			httpServer,
			wsServer
		};
	}

	private createZ21Infrastructure(
		cfg: ServerConfig,
		logger: Logger
	): {
		udp: Z21Udp;
		codec: Z21Codec;
		z21CommandService: Z21CommandService;
	} {
		const udp = new Z21Udp(
			cfg.z21.host,
			cfg.z21.udpPort,
			logger.child({
				component: 'z21.udp'
			})
		);

		const codec = new Z21Codec();

		const z21CommandService = new Z21CommandService(
			udp,
			logger.child({
				component: 'z21.service'
			}),
			new LocoEncoder(codec),
			new ProgrammingEncoder(codec),
			new SystemEncoder(codec),
			new TurnoutEncoder(codec)
		);

		return {
			udp,
			codec,
			z21CommandService
		};
	}

	private createZ21EventHandler({
		wsServer,
		logger,
		codec,
		locoManager,
		commandStationInfo,
		csInfoOrchestrator,
		cvProgrammingService
	}: {
		wsServer: AppWsServer;
		logger: Logger;
		codec: Z21Codec;
		locoManager: LocoManager;
		commandStationInfo: CommandStationInfo;
		csInfoOrchestrator: CommandStationInfoOrchestrator;
		cvProgrammingService: CvProgrammingService;
	}): Z21EventHandler {
		const resolver = new LanXCommandResolver();

		const lanXDecoder = new LanXDecoder(resolver);

		const systemInfoDecoder = new SystemInfoDecoder();

		const systemStateDecoder = new SystemStateDecoder();

		const datasetEventMapper = new Z21DatasetEventMapper(lanXDecoder, systemInfoDecoder, systemStateDecoder);

		const broadcast = (message: ServerToClient): void => {
			wsServer.broadcast(message);
		};

		return new Z21EventHandler(
			broadcast,
			locoManager,
			logger.child({
				component: 'z21.handler'
			}),
			commandStationInfo,
			csInfoOrchestrator,
			cvProgrammingService,
			codec,
			datasetEventMapper,
			systemStateDecoder
		);
	}
}
