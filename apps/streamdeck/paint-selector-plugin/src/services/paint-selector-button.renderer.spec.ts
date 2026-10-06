/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { PaintSelectorButton } from '@application-platform/paint-selector';

import { PaintSelectorButtonRenderer } from './paint-selector-button.renderer';

describe('PaintSelectorButtonRenderer', () => {
	let renderer: PaintSelectorButtonRenderer;

	beforeEach(() => {
		renderer = new PaintSelectorButtonRenderer();
	});

	it('should render an empty button', () => {
		const button: PaintSelectorButton = {
			type: 'empty'
		};

		const result = renderer.render(button);

		expect(result.image).toContain('data:image/svg+xml');
	});

	it.each([
		[
			'paint using its color',
			{
				type: 'paint',
				label: 'Mephiston Red',
				color: '#960c09'
			} as unknown as PaintSelectorButton,
			['#960c09', 'Mephiston']
		],
		[
			'escaped XML in labels',
			{
				type: 'category',
				label: 'A & B < C',
				value: 'test'
			} satisfies PaintSelectorButton,
			['A &amp; B &lt; C']
		],
		[
			'a default button',
			{
				type: 'home',
				label: 'Home'
			} satisfies PaintSelectorButton,
			['#151515', 'Home']
		],
		[
			'a long label split into two lines',
			{
				type: 'category',
				label: 'Mephiston Red',
				value: 'test'
			} satisfies PaintSelectorButton,
			['Mephiston', 'Red', 'y="64"', 'y="94"']
		],
		[
			'a long single word on the first line',
			{
				type: 'category',
				label: 'UltramarinesBlue',
				value: 'test'
			} satisfies PaintSelectorButton,
			['UltramarinesBlue']
		],
		[
			'black text on a light background',
			{
				type: 'color',
				label: 'Color',
				color: '#cccccc',
				value: 'red'
			} satisfies PaintSelectorButton,
			['fill="#000000"']
		],
		[
			'white text on a dark background',
			{
				type: 'color',
				label: 'Color',
				color: '#101010',
				value: 'red'
			} satisfies PaintSelectorButton,
			['fill="#ffffff"']
		],
		[
			'white text on a very dark background',
			{
				type: 'color',
				label: 'Color',
				color: '#050505',
				value: 'red'
			} satisfies PaintSelectorButton,
			['fill="#ffffff"']
		],
		[
			'the base category font size',
			{
				type: 'category',
				label: 'Base',
				value: 'base'
			} satisfies PaintSelectorButton,
			['font-size="28"']
		],
		[
			'the contrast category font size',
			{
				type: 'category',
				label: 'Contrast Red',
				value: 'contrast'
			} satisfies PaintSelectorButton,
			['font-size="24"']
		],
		[
			'the long category font size',
			{
				type: 'category',
				label: 'Very Long Category Name',
				value: 'long'
			} satisfies PaintSelectorButton,
			['font-size="20"']
		]
	] as const)('should render %s', (_description, button, expectedFragments) => {
		const svg = decodeSvg(renderer.render(button).image);

		for (const fragment of expectedFragments) {
			expect(svg).toContain(fragment);
		}
	});

	it.each([
		[24, '#151515', 'Home'],
		[12, '#5a1f1f', 'Server'],
		[13, '#5a1f1f', 'offline'],
		[0, '#000000', '']
	] as const)('should render offline slot %i', (slotIndex, expectedColor, expectedLabel) => {
		const svg = decodeSvg(renderer.renderOffline(slotIndex).image);

		expect(svg).toContain(expectedColor);

		if (expectedLabel) {
			expect(svg).toContain(expectedLabel);
		}
	});

	function decodeSvg(image?: string): string {
		if (!image) {
			throw new Error('Expected renderer to return an image.');
		}

		return decodeURIComponent(image.replace('data:image/svg+xml,', ''));
	}
});
