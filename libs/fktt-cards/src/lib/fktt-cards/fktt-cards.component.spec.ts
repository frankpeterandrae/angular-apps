import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FkttCardsComponent } from './fktt-cards.component';

describe('FkttCardsComponent', () => {
	let component: FkttCardsComponent;
	let fixture: ComponentFixture<FkttCardsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FkttCardsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(FkttCardsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
