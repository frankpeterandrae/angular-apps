/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { DataConnectionService } from '@angular-apps/services';
import { environment } from '../../environments/environment';

@Component({
	selector: 'fpa-home',
	standalone: true,
	imports: [],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	constructor(public apiService: DataConnectionService) {
		this.apiService.getData(environment).subscribe((data) => {
			console.log(data);
		});
	}

	public addData(): void {
		this.apiService.addData('Hello World', environment).subscribe((data) => {
			console.log(data);
		});
	}

	public deleteData(): void {
		this.apiService.deleteData(25, environment).subscribe((data) => {
			console.log(data);
		});
	}

	public addUser(): void {
		this.apiService
			.addUser({ email: 'info@frankpeterandrae.de', user: '7fandrae', password: '123456' }, environment)
			.subscribe((data) => {
				console.log(data);
			});
	}

	public login(): void {
		this.apiService.login({ email: 'info@frankpeterandrae.de', password: '123456' }, environment).subscribe((data) => {
			console.log(data);
		});
	}
}
