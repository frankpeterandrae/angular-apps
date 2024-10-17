import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Color } from '../models/color.model';

@Injectable({
	providedIn: 'root',
})
export class ColorService {
	private colorsUrl = 'assets/colors.json'; // Path to your JSON file

	constructor(private http: HttpClient) {}

	public getColors(): Observable<Color[]> {
		return this.http.get<Color[]>(this.colorsUrl);
	}
}
