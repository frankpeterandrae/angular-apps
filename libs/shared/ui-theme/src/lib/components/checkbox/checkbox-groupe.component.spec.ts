import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxGroupeComponent } from './checkbox-groupe.component';

describe('CheckboxGroupeComponent', () => {
	let component: CheckboxGroupeComponent;
	let fixture: ComponentFixture<CheckboxGroupeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CheckboxGroupeComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CheckboxGroupeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
