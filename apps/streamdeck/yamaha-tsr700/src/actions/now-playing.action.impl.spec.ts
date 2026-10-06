import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	yamaha: {
		getNetUsbPlayInfo: vi.fn()
	}
}));

const streamDeckMocks = vi.hoisted(() => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock('../services', () => ({
	yamaha: mocks.yamaha
}));

vi.mock('@elgato/streamdeck', () => ({
	default: {
		logger: streamDeckMocks.logger
	},
	action: () => (target: unknown) => target,
	SingletonAction: class {
		public actions: unknown[] = [];
	}
}));

import { NowPlayingActionImpl } from './now-playing.action.impl';

describe('NowPlayingActionImpl', () => {
	let action: NowPlayingActionImpl;
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();

		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValue(createPlayInfo());

		action = new NowPlayingActionImpl();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('retries the same album art after a temporary failure', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValue(createPlayInfo({ albumArtUrl: 'http://receiver/cover.jpg', albumArtId: 1 }));
		fetchMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(createFetchResponse({ contentType: 'image/jpeg' }));
		const key = createKeyAction();
		await action.onWillAppear({ action: key } as never);
		await action.onKeyDown({} as never);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(key.setImage).toHaveBeenLastCalledWith(expect.stringContaining('data:image/jpeg;base64,'));
	});

	it('updates a key action on appear and starts polling', async () => {
		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledOnce();
		expect(keyAction.setTitle).toHaveBeenCalledWith('');
		expect(keyAction.setImage).toHaveBeenCalledOnce();

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(decodeSvgDataUrl(image)).toContain('Playing');
		expect(decodeSvgDataUrl(image)).toContain('Papermoon');
		expect(decodeSvgDataUrl(image)).toContain('Kato');

		expect(vi.getTimerCount()).toBe(1);
	});

	it('ignores non-key actions on appear', async () => {
		const keyAction = {
			id: 'action-1',
			isKey: vi.fn().mockReturnValue(false),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).not.toHaveBeenCalled();
		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
	});

	it('refreshes visible actions on key down', async () => {
		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		await action.onKeyDown({} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(2);
		expect(keyAction.setImage).toHaveBeenCalledTimes(2);
	});

	it('polls every three seconds while visible', async () => {
		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(3000);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(3000);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(3);
	});

	it('does not create multiple polling timers for multiple visible actions', async () => {
		const firstAction = createKeyAction('action-1');
		const secondAction = createKeyAction('action-2');

		await action.onWillAppear({
			action: firstAction
		} as never);

		await action.onWillAppear({
			action: secondAction
		} as never);

		expect(vi.getTimerCount()).toBe(1);
		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(2);
	});

	it('keeps polling while at least one action remains visible', async () => {
		const firstAction = createKeyAction('action-1');
		const secondAction = createKeyAction('action-2');

		await action.onWillAppear({
			action: firstAction
		} as never);

		await action.onWillAppear({
			action: secondAction
		} as never);

		await action.onWillDisappear({
			action: {
				id: 'action-1'
			}
		} as never);

		expect(vi.getTimerCount()).toBe(1);

		await action.onWillDisappear({
			action: {
				id: 'action-2'
			}
		} as never);

		expect(vi.getTimerCount()).toBe(0);
	});

	it('stops polling when the last action disappears', async () => {
		const keyAction = createKeyAction('action-1');

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(vi.getTimerCount()).toBe(1);

		await action.onWillDisappear({
			action: {
				id: 'action-1'
			}
		} as never);

		expect(vi.getTimerCount()).toBe(0);
	});

	it('does nothing on key down when no action is visible', async () => {
		await action.onKeyDown({} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).not.toHaveBeenCalled();
	});

	it('shows unavailable image when play info cannot be loaded', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockRejectedValueOnce(new Error('receiver offline'));

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(streamDeckMocks.logger.warn).toHaveBeenCalledWith('Could not load NetUSB play info. receiver offline');

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(decodeSvgDataUrl(image)).toContain('Now Playing');
		expect(decodeSvgDataUrl(image)).toContain('Unavailable');
	});

	it('sets album art directly as image when album art can be loaded', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(fetchMock).toHaveBeenCalledWith('http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg', {
			method: 'GET'
		});

		expect(keyAction.setTitle).toHaveBeenCalledWith('Papermoon\nKato');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it('caches album art by album art id and url', async () => {
		const playInfo = createPlayInfo({
			albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
			albumArtId: 4408
		});

		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValue(playInfo);

		fetchMock.mockResolvedValue(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		await action.onKeyDown({} as never);

		expect(mocks.yamaha.getNetUsbPlayInfo).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(keyAction.setImage).toHaveBeenCalledTimes(2);
		expect(keyAction.setImage).toHaveBeenNthCalledWith(1, 'data:image/jpeg;base64,AQID');
		expect(keyAction.setImage).toHaveBeenNthCalledWith(2, 'data:image/jpeg;base64,AQID');
	});

	it('reloads album art when album art id changes', async () => {
		mocks.yamaha.getNetUsbPlayInfo
			.mockResolvedValueOnce(
				createPlayInfo({
					albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
					albumArtId: 4408
				})
			)
			.mockResolvedValueOnce(
				createPlayInfo({
					albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4409.jpg',
					albumArtId: 4409
				})
			);

		fetchMock
			.mockResolvedValueOnce(
				createFetchResponse({
					contentType: 'image/jpeg',
					bytes: [1, 2, 3]
				})
			)
			.mockResolvedValueOnce(
				createFetchResponse({
					contentType: 'image/jpeg',
					bytes: [4, 5, 6]
				})
			);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		await action.onKeyDown({} as never);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(keyAction.setImage).toHaveBeenNthCalledWith(1, 'data:image/jpeg;base64,AQID');
		expect(keyAction.setImage).toHaveBeenNthCalledWith(2, 'data:image/jpeg;base64,BAUG');
	});

	it('uses file extension when album art response has no content type', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.png',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: undefined,
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Papermoon\nKato');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/png;base64,AQID');
	});

	it('falls back to SVG image when album art content type is unsupported', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.ymf',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'application/octet-stream',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(decodeSvgDataUrl(image)).toContain('Papermoon');
		expect(decodeSvgDataUrl(image)).toContain('Kato');
	});

	it('falls back to SVG image when album art request fails', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				ok: false,
				status: 404,
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
	});

	it('falls back to SVG image when album art response is empty', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: []
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
	});

	it('falls back to SVG image when album art fetch throws', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockRejectedValueOnce(new Error('fetch failed'));

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(streamDeckMocks.logger.debug).toHaveBeenCalledWith('Could not fetch album art. fetch failed');

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
	});

	it.each([
		['pause', 'Paused'],
		['stop', 'Stopped'],
		['fast_reverse', 'Rewind'],
		['fast_forward', 'Forward']
	])('renders playback status %s as %s in SVG fallback', async (playback, expectedStatus) => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				playback
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain(expectedStatus);
	});

	it('uses album as primary text when track is missing', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: 'Cel-Shaded Memories',
				artist: 'Kato'
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain('Cel-Shaded');
		expect(svg).toContain('Memories');
		expect(svg).toContain('Kato');
	});

	it('uses formatted input as fallback when no title metadata exists', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: undefined,
				artist: undefined,
				input: 'amazon_music'
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain('Amazon Music');
	});

	it('escapes XML text in SVG fallback', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: '<Papermoon & Friends>',
				artist: '"Kato"'
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain('&lt;Papermoon');
		expect(svg).toContain('&amp;');
		expect(svg).toContain('&quot;Kato&quot;');
	});

	it('shortens cover title lines', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: 'This is a very long track title',
				artist: 'This is a very long artist name',
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('This is a very lo…\nThis is a very lo…');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it.each([
		['jpg', 'image/jpeg'],
		['jpeg', 'image/jpeg'],
		['bmp', 'image/bmp'],
		['webp', 'image/webp']
	])('uses file extension .%s when album art response has no content type', async (extension, expectedContentType) => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: `http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.${extension}`,
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: undefined,
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Papermoon\nKato');
		expect(keyAction.setImage).toHaveBeenCalledWith(`data:${expectedContentType};base64,AQID`);
	});

	it('falls back to SVG image when album art has unknown extension and no content type', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.ymf',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: undefined,
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(decodeSvgDataUrl(image)).toContain('Papermoon');
	});

	it('wraps very long words in SVG fallback', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: 'Supercalifragilisticexpialidocious Pneumonoultramicroscopicsilicovolcanoconiosis Antidisestablishmentarianism',
				artist: 'Kato'
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain('Supercalifragilisticexpialidocious');
		expect(svg).toContain('<text x="72" y="20" text-anchor="middle" class="status">Playing</text>');
		expect(svg).toContain('<text x="72" y="58" text-anchor="middle" class="primary">Supercalifragilisticexpialidocious</text>');
		expect(svg).toContain('<text x="72" y="82" text-anchor="middle" class="primary">Pneumonoultrami…</text>');
		expect(svg).toContain('<text x="72" y="124" text-anchor="middle" class="secondary">Kato</text>');
	});

	it('uses no title when no metadata and no input are available', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: undefined,
				artist: undefined,
				input: undefined
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;
		const svg = decodeSvgDataUrl(image);

		expect(svg).toContain('No title');
	});

	it('shows unavailable image when play info fails with a non-error value', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockRejectedValueOnce('receiver offline');

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(streamDeckMocks.logger.warn).toHaveBeenCalledWith('Could not load NetUSB play info. receiver offline');

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
		expect(decodeSvgDataUrl(image)).toContain('Now Playing');
		expect(decodeSvgDataUrl(image)).toContain('Unavailable');
	});

	it('uses album as cover title when track is missing', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: 'Album',
				artist: 'Kato',
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Album\nKato');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it('uses artist as cover title when track and album are missing', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: undefined,
				artist: 'Kato',
				input: 'amazon_music',
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Kato\nAmazon Music');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it('uses formatted input as cover title when metadata is missing', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: undefined,
				artist: undefined,
				input: 'amazon_music',
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Amazon Music');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it('uses Now Playing as cover title when metadata and input are missing', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				track: undefined,
				album: undefined,
				artist: undefined,
				input: undefined,
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Now Playing');
		expect(keyAction.setImage).toHaveBeenCalledWith('data:image/jpeg;base64,AQID');
	});

	it('uses album art cache key without album art id', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValue(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART.jpg',
				albumArtId: undefined
			})
		);

		fetchMock.mockResolvedValue(
			createFetchResponse({
				contentType: 'image/jpeg',
				bytes: [1, 2, 3]
			})
		);

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		await action.onKeyDown({} as never);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(keyAction.setImage).toHaveBeenNthCalledWith(1, 'data:image/jpeg;base64,AQID');
		expect(keyAction.setImage).toHaveBeenNthCalledWith(2, 'data:image/jpeg;base64,AQID');
	});

	it('falls back to SVG image when album art fetch throws a non-error value', async () => {
		mocks.yamaha.getNetUsbPlayInfo.mockResolvedValueOnce(
			createPlayInfo({
				albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumArtId: 4408
			})
		);

		fetchMock.mockRejectedValueOnce('fetch failed');

		const keyAction = createKeyAction();

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(streamDeckMocks.logger.debug).toHaveBeenCalledWith('Could not fetch album art. fetch failed');

		expect(keyAction.setTitle).toHaveBeenCalledWith('');

		const image = keyAction.setImage.mock.calls[0]?.[0] as string;

		expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
	});
});

function createKeyAction(id = 'action-1') {
	return {
		id,
		isKey: vi.fn().mockReturnValue(true),
		setTitle: vi.fn().mockResolvedValue(undefined),
		setImage: vi.fn().mockResolvedValue(undefined)
	};
}

function createPlayInfo(overrides: Record<string, unknown> = {}) {
	return {
		input: 'amazon_music',
		playback: 'play',
		repeat: 'off',
		shuffle: 'on',
		playTime: 8,
		totalTime: 92,
		artist: 'Kato',
		album: 'Cel-Shaded Memories',
		track: 'Papermoon',
		albumArtUrl: undefined,
		albumArtId: undefined,
		...overrides
	};
}

function createFetchResponse(options: { ok?: boolean; status?: number; contentType?: string; bytes?: number[] }) {
	const ok = options.ok ?? true;
	const status = options.status ?? 200;
	const bytes = options.bytes ?? [1, 2, 3];

	return {
		ok,
		status,
		headers: {
			get: vi.fn((name: string) => {
				if (name.toLowerCase() !== 'content-type') {
					return undefined;
				}

				return options.contentType;
			})
		},
		arrayBuffer: vi.fn().mockResolvedValue(Uint8Array.from(bytes).buffer)
	};
}

function decodeSvgDataUrl(dataUrl: string): string {
	const prefix = 'data:image/svg+xml;base64,';

	expect(dataUrl.startsWith(prefix)).toBe(true);

	return Buffer.from(dataUrl.slice(prefix.length), 'base64').toString('utf8');
}
