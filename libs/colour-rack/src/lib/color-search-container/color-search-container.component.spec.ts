import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSearchContainerComponent } from './color-search-container.component';

describe('ColorSearchContainerComponent', () => {
	let component: ColorSearchContainerComponent;
	let fixture: ComponentFixture<ColorSearchContainerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColorSearchContainerComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorSearchContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
