/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { DataConnectionService } from '@angular-apps/services';
import { CardComponent } from '@angular-apps/shared/ui-theme';

/**
 * Component representing the homepage feature.
 */
@Component({
	selector: 'homepage-feature',
	standalone: true,
	imports: [CardComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	/**
	 * Constructor for HomeComponent.
	 * @param {DataConnectionService} apiService - The service for data connection.
	 */
	constructor(public apiService: DataConnectionService) {}

	/**
	 * Adds data using the DataConnectionService.
	 */
	public addData(): void {
		this.apiService.addData('Hello World').subscribe((data) => {
			console.log(data);
		});
	}

	/**
	 * Deletes data using the DataConnectionService.
	 * @param {number} id - The ID of the data to delete.
	 */
	public deleteData(id: number): void {
		this.apiService.deleteData(id).subscribe((data) => {
			console.log(data);
		});
	}

	/**
	 * Adds a user using the DataConnectionService.
	 */
	public addUser(): void {
		this.apiService
			.addUser({ email: 'info@frankpeterandrae.de', user: '7fandrae', password: '123456' })
			.subscribe((data) => {
				console.log(data);
			});
	}

	/**
	 * Logs in a user using the DataConnectionService.
	 */
	public login(): void {
		this.apiService.login({ email: 'info@frankpeterandrae.de', password: '123456' }).subscribe((data) => {
			console.log(data);
		});
	}
}
