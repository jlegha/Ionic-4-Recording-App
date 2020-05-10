import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyProfilesPage } from './my-profiles.page';

describe('MyProfilesPage', () => {
  let component: MyProfilesPage;
  let fixture: ComponentFixture<MyProfilesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyProfilesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
