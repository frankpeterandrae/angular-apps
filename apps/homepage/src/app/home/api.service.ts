import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	private apiUrl = '/php-api/api.php'; // URL of your Ruby API

	constructor(private http: HttpClient) {}

	public getData(): Observable<any> {
		return this.http.get(this.apiUrl, { params: { action: 'getData' } });
	}

	public addData(list: string): Observable<any> {
		const body = new FormData();
		body.append('action', 'addData');
		body.append('list', list);
		body.append('date', new Date().toISOString());

		return this.http.post(`${this.apiUrl}`, body);
	}

	public deleteData(id: number): Observable<any> {
		const body = new FormData();
		body.append('action', 'deleteData');
		body.append('id', id.toString());

		return this.http.post(`${this.apiUrl}`, body);
	}
}
