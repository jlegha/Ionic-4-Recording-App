import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaticPagePage } from './static-page.page';

describe('StaticPagePage', () => {
  let component: StaticPagePage;
  let fixture: ComponentFixture<StaticPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StaticPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
