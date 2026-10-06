import type { NetUsbPlayInfo, NetUsbPlaybackStatus } from '../yamaha';

/** Renders playback metadata as key titles or escaped SVG fallback images. */
export class NowPlayingRenderer {
	/** Creates a two-line key title, preferring track, album, artist and then the input name. */
	public createCoverTitle(playInfo: NetUsbPlayInfo): string {
		const primary =
			this.clean(playInfo.track) ??
			this.clean(playInfo.album) ??
			this.clean(playInfo.artist) ??
			this.formatId(playInfo.input) ??
			'Now Playing';

		const secondary = this.getSecondaryLine(playInfo, primary);

		return [this.shorten(primary, 18), secondary ? this.shorten(secondary, 18) : undefined].filter(Boolean).join('\n');
	}

	/** Creates an SVG data URL for playback without usable artwork; metadata is XML-escaped. */
	public createNowPlayingImage(playInfo: NetUsbPlayInfo): string {
		const status = this.getPlaybackText(playInfo.playback);

		const primary =
			this.clean(playInfo.track) ??
			this.clean(playInfo.album) ??
			this.clean(playInfo.artist) ??
			this.formatId(playInfo.input) ??
			'No title';

		const secondary = this.getSecondaryLine(playInfo, primary);

		const primaryLines = this.wrap(primary, 16, 2);
		const secondaryLine = secondary ? this.shorten(secondary, 20) : '';

		return this.createSvg(
			[
				`<text x="72" y="20" text-anchor="middle" class="status">${this.escapeXml(status)}</text>`,

				...primaryLines.map(
					(line, index) =>
						`<text x="72" y="${58 + index * 24}" text-anchor="middle" class="primary">${this.escapeXml(line)}</text>`
				),

				secondaryLine ? `<text x="72" y="124" text-anchor="middle" class="secondary">${this.escapeXml(secondaryLine)}</text>` : ''
			].join('')
		);
	}

	private createSvg(content: string): string {
		const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
			<rect width="144" height="144" rx="18" fill="#111111"/>
			<rect x="8" y="8" width="128" height="128" rx="14" fill="#1c1c1c"/>
			<style>
				.status {
					font-family: Arial, sans-serif;
					font-size: 12px;
					font-weight: 700;
					fill: #a8a8a8;
					letter-spacing: 1.2px;
					text-transform: uppercase;
				}

				.primary {
					font-family: Arial, sans-serif;
					font-size: 19px;
					font-weight: 800;
					fill: #ffffff;
				}

				.secondary {
					font-family: Arial, sans-serif;
					font-size: 13px;
					font-weight: 600;
					fill: #b8b8b8;
				}
			</style>
			${content}
		</svg>
	`;
		return this.createSvgDataUrl(svg);
	}

	/** Creates the SVG fallback shown when playback information cannot be loaded. */
	public createUnavailableImage(): string {
		const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
			<rect width="144" height="144" rx="18" fill="#111111" />
			<rect x="6" y="6" width="132" height="132" rx="16" fill="#1b1b1b" />

			<text x="72" y="62" text-anchor="middle" class="primary">Now Playing</text>
			<text x="72" y="86" text-anchor="middle" class="secondary">Unavailable</text>

			<style>
				.primary {
					font-family: Arial, sans-serif;
					font-size: 16px;
					font-weight: 800;
					fill: #ffffff;
				}

				.secondary {
					font-family: Arial, sans-serif;
					font-size: 12px;
					font-weight: 600;
					fill: #bdbdbd;
				}
			</style>
		</svg>
	`;

		return this.createSvgDataUrl(svg);
	}

	private createSvgDataUrl(svg: string): string {
		return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
	}

	private getPlaybackText(playback: NetUsbPlaybackStatus): string {
		switch (playback) {
			case 'play':
				return 'Playing';
			case 'pause':
				return 'Paused';
			case 'stop':
				return 'Stopped';
			case 'fast_reverse':
				return 'Rewind';
			case 'fast_forward':
				return 'Forward';
		}
	}

	private getSecondaryLine(playInfo: NetUsbPlayInfo, primary: string): string | undefined {
		const candidates = [this.clean(playInfo.artist), this.clean(playInfo.album), this.formatId(playInfo.input)];

		return candidates.find((candidate) => candidate && candidate !== primary);
	}

	private clean(value: string | undefined): string | undefined {
		const trimmed = value?.trim();

		return trimmed || undefined;
	}

	private shorten(value: string, maxLength: number): string {
		if (value.length <= maxLength) {
			return value;
		}

		return `${value.slice(0, maxLength - 1)}…`;
	}

	private wrap(value: string, maxLength: number, maxLines: number): string[] {
		const words = value.split(' ');
		const lines: string[] = [];
		let currentLine = '';

		for (const word of words) {
			const nextLine = currentLine ? `${currentLine} ${word}` : word;

			if (nextLine.length <= maxLength) {
				currentLine = nextLine;
				continue;
			}

			if (currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				lines.push(word);
				currentLine = '';
			}

			if (lines.length === maxLines) {
				break;
			}
		}

		if (currentLine && lines.length < maxLines) {
			lines.push(currentLine);
		}

		if (lines.length > 0 && value.length > lines.join(' ').length) {
			const lastIndex = lines.length - 1;
			lines[lastIndex] = this.shorten(lines[lastIndex], maxLength);
		}

		return lines.length > 0 ? lines : ['No title'];
	}

	private formatId(id: string | undefined): string | undefined {
		if (!id) {
			return undefined;
		}

		return id
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	private escapeXml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&apos;');
	}
}
