/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataConnectionService } from '@angular-apps/services';
import { ButtonComponent } from '../button/button.component';
import { ColorDefinition } from '../../enums';

@Component({
	selector: 'theme-login',
	standalone: true,
	imports: [ReactiveFormsModule, ButtonComponent],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent {
	protected readonly ColorDefinition = ColorDefinition;

	public loginForm: FormGroup;

	constructor(
		private dataConnection: DataConnectionService,
		private formBuilder: FormBuilder,
	) {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required],
		});
	}

	public login(): void {
		if (this.loginForm.valid) {
			const { email, password } = this.loginForm.value;
			this.dataConnection.login({ email, password }).subscribe((data) => {
				console.log(data);
			});
		}
	}
}
