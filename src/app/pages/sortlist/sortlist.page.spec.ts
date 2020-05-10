import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SortlistPage } from './sortlist.page';

describe('SortlistPage', () => {
  let component: SortlistPage;
  let fixture: ComponentFixture<SortlistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortlistPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SortlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
