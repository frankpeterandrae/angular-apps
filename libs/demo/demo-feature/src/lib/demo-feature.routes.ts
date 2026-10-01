/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Routes } from '@angular/router';

export const demoFeatureRoutes: Routes = [
	{ path: '', redirectTo: 'button', pathMatch: 'full' },
	{
		path: 'button',
		loadComponent: () => import('./components/actions/button/button-demo.component').then((m) => m.ButtonDemoComponent)
	},
	{
		path: 'button-bar',
		loadComponent: () => import('./components/actions/button-bar/button-bar-demo.component').then((m) => m.ButtonBarDemoComponent)
	},
	{
		path: 'card',
		loadComponent: () => import('./components/layout/card/card-demo.component').then((m) => m.CardDemoComponent)
	},
	{
		path: 'checkbox',
		loadComponent: () => import('./components/forms/checkbox/checkbox-demo.component').then((m) => m.CheckboxDemoComponent)
	},
	{
		path: 'dialog',
		loadComponent: () => import('./components/overlay/dialog/dialog-demo.component').then((m) => m.DialogDemoComponent)
	},
	{
		path: 'dropdown-select',
		loadComponent: () => import('./components/actions/dropdown/dropdown-demo.component').then((m) => m.DropdownDemoComponent)
	},
	{
		path: 'colors',
		loadComponent: () => import('./foundations/colors/colors.component').then((m) => m.ColorsComponent)
	},
	{
		path: 'icons',
		loadComponent: () => import('./foundations/icon/icon-demo.component').then((m) => m.IconDemoComponent)
	},
	{
		path: 'image-loader',
		loadComponent: () => import('./components/display/image-loader/image-loader.component').then((m) => m.ImageLoaderDemoComponent)
	},
	{
		path: 'input',
		loadComponent: () => import('./components/forms/input/input-demo.component').then((m) => m.InputDemoComponent)
	},
	{
		path: 'language-toggle',
		loadComponent: () =>
			import('./components/controls/language-toggle/language-toggle-demo.component').then((m) => m.LanguageToggleDemoComponent)
	},
	{
		path: 'range-input',
		loadComponent: () => import('./components/forms/range-input/range-input-demo.component').then((m) => m.RangeInputDemoComponent)
	},
	{
		path: 'select',
		loadComponent: () => import('./components/forms/select/select-demo.component').then((m) => m.SelectDemoComponent)
	},
	{
		path: 'tabs',
		loadComponent: () => import('./components/navigation/tabs/tabs-demo.component').then((m) => m.TabsDemoComponent)
	},
	{
		path: 'textarea',
		loadComponent: () => import('./components/forms/textarea/textarea-demo.component').then((m) => m.TextareaDemoComponent)
	},
	{
		path: 'tooltip',
		loadComponent: () => import('./components/overlay/tooltip/tooltip-demo.component').then((m) => m.TooltipDemoComponent)
	},
	{
		path: 'tree-view',
		loadComponent: () => import('./components/display/tree-view/tree-view-demo.component').then((m) => m.TreeViewDemoComponent)
	},
	{
		path: 'typography',
		loadComponent: () => import('./components/typography/typography-demo.component').then((m) => m.TypographyDemoComponent)
	},
	{
		path: 'footer',
		loadComponent: () => import('./components/layout/footer/footer-demo.component').then((m) => m.FooterDemoComponent)
	},
	{
		path: 'header',
		loadComponent: () => import('./components/layout/header/header-demo.component').then((m) => m.HeaderDemoComponent)
	}
];
