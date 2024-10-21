/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { DataConnectionService } from '@angular-apps/services';

@Component({
	selector: 'homepage-feature',
	standalone: true,
	imports: [],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	constructor(public apiService: DataConnectionService) {}

	public addData(): void {
		this.apiService.addData('Hello World').subscribe((data) => {
			console.log(data);
		});
	}

	public deleteData(): void {
		this.apiService.deleteData(25).subscribe((data) => {
			console.log(data);
		});
	}

	public addUser(): void {
		this.apiService
			.addUser({ email: 'info@frankpeterandrae.de', user: '7fandrae', password: '123456' })
			.subscribe((data) => {
				console.log(data);
			});
	}

	public login(): void {
		this.apiService.login({ email: 'info@frankpeterandrae.de', password: '123456' }).subscribe((data) => {
			console.log(data);
		});
	}
}
