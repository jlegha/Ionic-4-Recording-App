import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InterestPage } from './interestPage.page';

describe('InterestPage', () => {
  let component: InterestPage;
  let fixture: ComponentFixture<InterestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InterestPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InterestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
