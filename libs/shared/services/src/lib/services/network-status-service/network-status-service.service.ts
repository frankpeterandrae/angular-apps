import { Injectable } from '@angular/core';
import { fromEvent, map, merge, of } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class NetworkStatusServiceService {
	public readonly status$ = merge(
		fromEvent(window, 'offline').pipe(map(() => false)),
		fromEvent(window, 'online').pipe(map(() => true)),
		of(navigator.onLine),
	);
}
