import streamDeck from '@elgato/streamdeck';

import type { NetUsbPlayInfo } from '../yamaha';

/** Downloads supported cover images and caches the last successful URL and artwork ID. */
export class AlbumArtService {
	private cachedAlbumArtKey?: string;
	private cachedAlbumArtDataUrl?: string;

	/** Returns cached or downloaded artwork; failed downloads remain retryable on subsequent refreshes. */
	public async resolve(playInfo: NetUsbPlayInfo): Promise<string | undefined> {
		if (!playInfo.albumArtUrl) {
			return undefined;
		}

		const cacheKey = `${playInfo.albumArtId ?? ''}|${playInfo.albumArtUrl}`;

		if (this.cachedAlbumArtKey === cacheKey) {
			return this.cachedAlbumArtDataUrl;
		}

		const dataUrl = await this.fetchAlbumArtAsDataUrl(playInfo.albumArtUrl);

		if (dataUrl) {
			this.cachedAlbumArtKey = cacheKey;
			this.cachedAlbumArtDataUrl = dataUrl;
		}

		return dataUrl;
	}

	private async fetchAlbumArtAsDataUrl(url: string): Promise<string | undefined> {
		try {
			streamDeck.logger.debug(`Loading album art from ${url}`);

			const response = await fetch(url, {
				method: 'GET'
			});

			const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();

			streamDeck.logger.debug('Album art response', {
				url,
				ok: response.ok,
				status: response.status,
				contentType
			});

			if (!response.ok) {
				return undefined;
			}

			if (!this.isSupportedAlbumArt(url, contentType)) {
				streamDeck.logger.debug(`Unsupported album art. contentType=${contentType ?? 'unknown'}, url=${url}`);
				return undefined;
			}

			const buffer = Buffer.from(await response.arrayBuffer());

			if (buffer.length === 0) {
				streamDeck.logger.debug(`Album art response was empty. url=${url}`);
				return undefined;
			}

			const resolvedContentType = contentType ?? this.getContentTypeFromUrl(url);

			streamDeck.logger.debug('Album art loaded', {
				url,
				contentType: resolvedContentType,
				bytes: buffer.length
			});

			return `data:${resolvedContentType};base64,${buffer.toString('base64')}`;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			streamDeck.logger.debug(`Could not fetch album art. ${message}`);

			return undefined;
		}
	}

	private isSupportedAlbumArt(url: string, contentType: string | undefined): boolean {
		if (contentType) {
			return this.isSupportedAlbumArtContentType(contentType);
		}

		return this.getContentTypeFromUrl(url) !== undefined;
	}

	private getContentTypeFromUrl(url: string): string | undefined {
		const pathname = new URL(url).pathname.toLowerCase();

		if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
			return 'image/jpeg';
		}

		if (pathname.endsWith('.png')) {
			return 'image/png';
		}

		if (pathname.endsWith('.bmp')) {
			return 'image/bmp';
		}

		if (pathname.endsWith('.webp')) {
			return 'image/webp';
		}

		return undefined;
	}

	private isSupportedAlbumArtContentType(contentType: string): boolean {
		return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'].includes(contentType);
	}
}
