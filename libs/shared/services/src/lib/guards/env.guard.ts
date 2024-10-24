/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '@angular-apps/config';

@Injectable({
	providedIn: 'root',
})
export class EnvGuard implements CanActivate {
	constructor(private router: Router) {}

	public canActivate(): boolean {
		if (!environment.production) {
			return true;
		} else {
			this.router.navigate(['/404']);
			return false;
		}
	}
}
