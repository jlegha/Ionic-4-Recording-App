import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommingSoonPage } from './comming-soon.page';

describe('CommingSoonPage', () => {
  let component: CommingSoonPage;
  let fixture: ComponentFixture<CommingSoonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommingSoonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommingSoonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
