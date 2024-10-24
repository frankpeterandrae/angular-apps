/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { InjectionToken } from '@angular/core';
import { DialogConfigModel } from '../../model/dialog-config.model';

// Define the DIALOG_DATA injection token
export const DIALOG_DATA = new InjectionToken<DialogConfigModel<any>>('DialogData');
