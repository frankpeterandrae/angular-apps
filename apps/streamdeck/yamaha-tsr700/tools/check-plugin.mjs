import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { WebSocketServer } from 'ws';

const pluginRoot = resolve('dist/apps/streamdeck/yamaha-tsr700/de.frankpeterandrae.yamaha.sdPlugin');
const entry = resolve(pluginRoot, 'bin/plugin.mjs');
const syntax = spawnSync(process.execPath, ['--check', entry], { encoding: 'utf8' });
assert.equal(syntax.status, 0, syntax.stderr);

let child;
let clicked = false;
let registered = false;
const receiver = createServer((request, response) => {
	response.setHeader('Content-Type', 'application/json');
	const path = new URL(request.url, 'http://localhost').pathname;
	if (path.endsWith('/setPower')) {
		assert.equal(new URL(request.url, 'http://localhost').searchParams.get('power'), 'standby');
		clicked = true;
	}
	response.end(
		JSON.stringify(
			path.endsWith('/getFeatures')
				? { response_code: 0, system: { func_list: [] }, zone: [{ id: 'main', func_list: ['power'] }] }
				: { response_code: 0, power: 'standby', volume: 0, max_volume: 100, input: 'hdmi1', input_text: 'HDMI 1' }
		)
	);
});
const socketServer = new WebSocketServer({ host: '127.0.0.1', port: 0 });
try {
	await new Promise((resolve) => receiver.listen(0, '127.0.0.1', resolve));
	if (!socketServer.address()) await new Promise((resolve) => socketServer.on('listening', resolve));
	const receiverAddress = `127.0.0.1:${receiver.address().port}`;
	const action = 'de.frankpeterandrae.yamaha.power-off-all';
	socketServer.on('connection', (socket) => {
		socket.on('message', (bytes) => {
			const message = JSON.parse((Array.isArray(bytes) ? Buffer.concat(bytes) : Buffer.from(bytes)).toString('utf8'));
			if (message.event === 'registerPlugin') {
				registered = true;
				socket.send(
					JSON.stringify({
						event: 'willAppear',
						action,
						context: 'smoke-key',
						device: 'smoke-device',
						payload: {
							settings: {},
							controller: 'Keypad',
							coordinates: { column: 0, row: 0 },
							state: 0,
							isInMultiAction: false
						}
					})
				);
			}
			if (message.event === 'getGlobalSettings') {
				socket.send(
					JSON.stringify({
						event: 'didReceiveGlobalSettings',
						context: message.context,
						id: message.id,
						payload: { settings: { receiverAddress } }
					})
				);
			}
			if (message.event === 'setImage') {
				socket.send(
					JSON.stringify({
						event: 'keyDown',
						action,
						context: 'smoke-key',
						device: 'smoke-device',
						payload: {
							settings: {},
							controller: 'Keypad',
							coordinates: { column: 0, row: 0 },
							state: 0,
							isInMultiAction: false
						}
					})
				);
			}
		});
	});
	child = spawn(
		process.execPath,
		[
			entry,
			'-port',
			String(socketServer.address().port),
			'-pluginUUID',
			'smoke-plugin',
			'-registerEvent',
			'registerPlugin',
			'-info',
			JSON.stringify({
				application: { version: '7.1.0' },
				devices: [{ id: 'smoke-device', type: 0, name: 'Test Stream Deck', size: { columns: 5, rows: 3 } }],
				plugin: { version: '0.1.0.0' }
			})
		],
		{ cwd: pluginRoot, stdio: ['ignore', 'pipe', 'pipe'] }
	);
	let output = '';
	child.stdout.on('data', (data) => {
		output += data;
	});
	child.stderr.on('data', (data) => {
		output += data;
	});
	await new Promise((resolve, reject) => {
		const deadline = setTimeout(() => {
			clearInterval(poll);
			reject(new Error(`Plugin did not register and execute the button command. ${output}`));
		}, 8000);
		const poll = setInterval(() => {
			if (registered && clicked) {
				clearInterval(poll);
				clearTimeout(deadline);
				resolve();
			}
		}, 20);
	});
	console.log('Plugin syntax, startup, registration and button command passed.');
} finally {
	child?.kill();
	for (const client of socketServer.clients) client.terminate();
	await new Promise((resolve) => socketServer.close(resolve));
	await new Promise((resolve) => receiver.close(resolve));
}
