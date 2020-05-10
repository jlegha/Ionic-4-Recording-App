import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LagnVivahPage } from './lagn-vivah.page';

describe('LagnVivahPage', () => {
  let component: LagnVivahPage;
  let fixture: ComponentFixture<LagnVivahPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LagnVivahPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LagnVivahPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
