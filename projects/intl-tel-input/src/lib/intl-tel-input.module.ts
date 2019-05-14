import {ModuleWithProviders, NgModule} from '@angular/core';
import { IntlTelInputComponent } from './intl-tel-input.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IntlTelInputService} from './intl-tel-input.service';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';


@NgModule({
  declarations: [IntlTelInputComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatInputModule
  ],
  exports: [IntlTelInputComponent]
})
export class IntlTelInputModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IntlTelInputModule,
      providers: [IntlTelInputService]
    };
  }
}
