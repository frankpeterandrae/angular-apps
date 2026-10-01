/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { type Mocked, createMock } from '@application-platform/testing';
import { vi } from 'vitest';

import { setupTestingModule } from '../../../test-setup';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
	let fixture: ComponentFixture<HomeComponent>;
	let mockMeta: Mocked<Meta>;
	let mockTitle: Mocked<Title>;

	beforeEach(async () => {
		mockMeta = createMock<Meta>({
			addTag: vi.fn()
		});

		mockTitle = createMock<Title>({
			setTitle: vi.fn()
		});

		await setupTestingModule({
			imports: [HomeComponent],
			providers: [
				{ provide: Meta, useValue: mockMeta },
				{ provide: Title, useValue: mockTitle }
			]
		});

		fixture = TestBed.createComponent(HomeComponent);
		fixture.detectChanges();
	});

	it('should set the page metadata', () => {
		expect(mockTitle.setTitle).toHaveBeenCalledWith('homepageFeatureI18n.HomeComponent.meta.Title');

		expect(mockMeta.addTag).toHaveBeenCalledWith({
			name: 'description',
			content: 'homepageFeatureI18n.HomeComponent.meta.Description'
		});
	});
});
