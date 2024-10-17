import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
	selector: 'fpa-home',
	standalone: true,
	imports: [],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	constructor(public apiService: ApiService) {
		this.apiService.getData().subscribe((data) => {
			console.log(data);
		});
	}

	public addData(): void {
		this.apiService.addData('Hello World').subscribe((data) => {
			console.log(data);
		});
	}

	public deleteData(): void {
		this.apiService.deleteData(24).subscribe((data) => {
			console.log(data);
		});
	}
}
