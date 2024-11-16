/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { setupTestingModule } from '../../../test-setup';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [LoginComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should create the login form with email and password controls', () => {
		expect(component.loginForm.contains('email')).toBeTruthy();
		expect(component.loginForm.contains('password')).toBeTruthy();
	});

	it('should mark email control as invalid if empty', () => {
		const emailControl = component.loginForm.get('email');
		emailControl.setValue('');
		expect(emailControl.invalid).toBeTruthy();
	});

	it('should mark email control as invalid if not a valid email', () => {
		const emailControl = component.loginForm.get('email');
		emailControl.setValue('invalid-email');
		expect(emailControl.invalid).toBeTruthy();
	});

	it('should mark password control as invalid if empty', () => {
		const passwordControl = component.loginForm.get('password');
		passwordControl.setValue('');
		expect(passwordControl.invalid).toBeTruthy();
	});

	it('should call dataConnection.login with form values if form is valid', () => {
		const loginSpy = jest.spyOn(component.dataConnection, 'login').mockReturnValue(of({}));
		component.loginForm.setValue({ email: 'test@example.com', password: 'password' });
		component.login();
		expect(loginSpy).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
	});

	it('should not call dataConnection.login if form is invalid', () => {
		const loginSpy = jest.spyOn(component.dataConnection, 'login');
		component.loginForm.setValue({ email: '', password: '' });
		component.login();
		expect(loginSpy).not.toHaveBeenCalled();
	});
});
