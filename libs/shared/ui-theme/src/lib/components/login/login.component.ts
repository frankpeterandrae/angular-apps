/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataConnectionService } from '@angular-apps/services';
import { ButtonComponent } from '../button/button.component';
import { ColorDefinition } from '../../enums';

/**
 * Component for the login form.
 */
@Component({
	selector: 'theme-login',
	standalone: true,
	imports: [ReactiveFormsModule, ButtonComponent],
	templateUrl: './login.component.html',
})
export class LoginComponent {
	/**
	 * Enum for color definitions.
	 */
	protected readonly ColorDefinition = ColorDefinition;

	/**
	 * Form group for the login form.
	 */
	public loginForm: FormGroup;

	/**
	 * Constructor for LoginComponent.
	 * @param dataConnection - Service for data connection.
	 * @param formBuilder - Service to create form groups.
	 */
	constructor(
		public dataConnection: DataConnectionService,
		private readonly formBuilder: FormBuilder,
	) {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required],
		});
	}

	/**
	 * Method to handle login action.
	 */
	public login(): void {
		if (this.loginForm.valid) {
			const { email, password } = this.loginForm.value;
			this.dataConnection.login({ email, password }).subscribe((data) => {
				console.log(data);
			});
		}
	}
}
