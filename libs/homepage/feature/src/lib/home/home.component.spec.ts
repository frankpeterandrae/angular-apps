/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { DataConnectionService } from '@angular-apps/services';
import { of } from 'rxjs';

describe('HomeComponent', () => {
	let component: HomeComponent;
	let fixture: ComponentFixture<HomeComponent>;
	let mockService: jest.Mocked<DataConnectionService>;

	beforeEach(async () => {
		mockService = {
			addData: jest.fn().mockReturnValue(of('data added')),
			deleteData: jest.fn().mockReturnValue(of('data deleted')),
			addUser: jest.fn().mockReturnValue(of('user added')),
			login: jest.fn().mockReturnValue(of('user logged in')),
		} as unknown as jest.Mocked<DataConnectionService>;

		await TestBed.configureTestingModule({
			imports: [HomeComponent],
			providers: [{ provide: DataConnectionService, useValue: mockService }],
		}).compileComponents();

		fixture = TestBed.createComponent(HomeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should add data', () => {
		component.addData();
		expect(mockService.addData).toHaveBeenCalledWith('Hello World');
	});

	it('should delete data with an ID', () => {
		component.deleteData(1);
		expect(mockService.deleteData).toHaveBeenCalledWith(1);
	});

	it('should add a user', () => {
		component.addUser();
		expect(mockService.addUser).toHaveBeenCalledWith({
			email: 'info@frankpeterandrae.de',
			user: '7fandrae',
			password: '123456',
		});
	});

	it('should log in a user', () => {
		component.login();
		expect(mockService.login).toHaveBeenCalledWith({
			email: 'info@frankpeterandrae.de',
			password: '123456',
		});
	});
});
