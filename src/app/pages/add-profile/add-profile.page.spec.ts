import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddProfilePage } from './add-profile.page';

describe('AddProfilePage', () => {
  let component: AddProfilePage;
  let fixture: ComponentFixture<AddProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddProfilePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
