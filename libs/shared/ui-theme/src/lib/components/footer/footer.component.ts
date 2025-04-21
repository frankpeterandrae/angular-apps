/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';

/**
 * FooterComponent is a standalone Angular component that represents the footer section of the theme.
 */
@Component({
    selector: 'theme-footer',
    imports: [TranslationPipe, AsyncPipe],
    templateUrl: './footer.component.html'
})
export class FooterComponent {}
