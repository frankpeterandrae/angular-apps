/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../model/environment.model';

@Injectable({
	providedIn: 'root',
})
export class DataConnectionService {
	private apiUrl = '/php-api/api.php'; // Use the environment-specific API URL
	private addUserUrl = '/php-api/encryption.php'; // Use the environment-specific API URL
	private loginUrl = '/php-api/login.php'; // Use the environment-specific API URL

	constructor(private http: HttpClient) {}

	public getData(environment: Environment): Observable<any> {
		return this.http.get(`${environment.baseUrl}${this.apiUrl}`, { params: { action: 'getData' } });
	}

	public addData(list: string, environment: Environment): Observable<any> {
		const body = new FormData();
		body.append('action', 'addData');
		body.append('list', list);
		body.append('date', new Date().toISOString());

		return this.http.post(`${environment.baseUrl}${this.apiUrl}`, body, { withCredentials: true });
	}

	public deleteData(id: number, environment: Environment): Observable<any> {
		const body = new FormData();
		body.append('action', 'deleteData');
		body.append('id', id.toString());

		return this.http.post(`${environment.baseUrl}${this.apiUrl}`, body, { withCredentials: true });
	}

	public addUser(
		userInfo: { user: string; password: string; email: string },
		environment: Environment,
	): Observable<any> {
		const body = new FormData();
		body.append('action', 'addUser');
		body.append('username', userInfo.user);
		body.append('password', userInfo.password);
		body.append('email', userInfo.email);

		return this.http.post(`${environment.baseUrl}${this.addUserUrl}`, body, { withCredentials: true });
	}

	public login(param: { password: string; email: string }, environment: Environment): Observable<any> {
		const body = new FormData();
		body.append('action', 'login');
		body.append('email', param.email);
		body.append('password', param.password);

		return this.http.post(`${environment.baseUrl}${this.loginUrl}`, body, { withCredentials: true });
	}
}
