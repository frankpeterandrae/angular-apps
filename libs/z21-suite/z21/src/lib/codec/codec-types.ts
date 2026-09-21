/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

/**
 * Represents a decoded dataset extracted from a Z21 UDP frame.
 *
 * Unknown or malformed frames are preserved as diagnostic datasets so callers
 * can inspect unexpected protocol input.
 */
export type Z21Dataset =
	| { kind: 'ds.serial'; serial: number }
	| { kind: 'ds.x.bus'; xHeader: number; data: Uint8Array }
	| { kind: 'ds.system.state'; state: Uint8Array }
	| { kind: 'ds.unknown'; header: number; payload: Uint8Array; reason: string }
	| { kind: 'ds.bad_xor'; calc: string; recv: string }
	| { kind: 'ds.hwinfo'; hwtype: number; fwVersionBcd: number }
	| { kind: 'ds.code'; code: number }
	| { kind: 'ds.broadcast.flags'; flags: number };
