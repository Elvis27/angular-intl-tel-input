import {
  Component,
  forwardRef,
  Input,
  OnInit,
  OnDestroy,
  Optional,
  Self,
  ElementRef,
  HostBinding} from '@angular/core';
import {CountryCode} from './resource/country-code';
import * as lpn from 'google-libphonenumber';
import {Country} from './model/country.model';
import {ControlValueAccessor, NG_VALIDATORS, NgControl} from '@angular/forms';
import {phoneNumberValidator} from './intl-tel-input.validator';
import { MatFormFieldControl } from '@angular/material/form-field';
import { IntlTelphone } from './model/intlTel.mode';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatSelectChange } from '@angular/material/select';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'intl-tel-input',
  templateUrl: './intl-tel-input.component.html',
  styles: [
    'li.country:hover { background-color: rgba(0, 0, 0, 0.05); }',
    '.selected-flag.dropdown-toggle:after { content: none; }',
    '.flag-container.disabled {cursor: default !important; }',
    '.intl-tel-input.allow-dropdown .flag-container.disabled:hover .selected-flag { background: none; }'
  ],
  providers: [
    CountryCode,
    {
      provide: NG_VALIDATORS,
      useValue: phoneNumberValidator,
      multi: true,
    },
    {
      provide: MatFormFieldControl,
      useExisting: forwardRef(() => IntlTelInputComponent),
    }
  ],
})
export class IntlTelInputComponent implements MatFormFieldControl<IntlTelphone>, OnInit, OnDestroy, ControlValueAccessor {
  static nextId = 0;
  @Input()
  get value(): IntlTelphone {
    return this._value;
  }
  set value(val: IntlTelphone) {
    const { number, countryCode} = val;
    if (number) {
      this.phoneNumber = number;
    }
    if (countryCode) {
      this.selectedCountry = this.allCountries.find(
        c => c.iso2 === countryCode.toLowerCase()
      );
    }

    this._onTouched();
    this.stateChanges.next();
  }
  private _value: IntlTelphone;

  @Input() preferredCountries: Array<string> = [];
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input() disabled = false;
  @Input() controlId: string;

  stateChanges = new Subject<void>();
  phoneNumber = '';
  allCountries: Array<Country> = [];
  preferredCountriesInDropDown: Array<Country> = [];
  selectedCountry: Country;
  phoneUtil = lpn.PhoneNumberUtil.getInstance();
  focused = false;
  controlType = 'intl-tel-input';
  private _hasError = false;
  private _touched = false;

  get empty() {
    return !this.phoneNumber && !this.selectedCountry;
  }

  @HostBinding() id = `mat-intl-tel-input-${this.controlId || IntlTelInputComponent.nextId++}`;

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.phoneNumber;
  }

  @HostBinding('class.mat-form-field-should-float') get shouldPlaceholderFloat() {
    return this.focused || !this.phoneNumber;
  }

  @HostBinding('class.mat-form-field-invalid') get isErrored() {
    return this._hasError;
  }

  @HostBinding('class.file-input-disabled') get isDisabled() {
    return this.disabled;
  }

  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  get errorState() {
    return this._hasError;
  }
  set errorState(error) {
    this._hasError = error;
  }

  private propagateChange = (_: any) => {};
  private _onTouched = () => {
    this._touched = true;
  }

  get touched() {
    return this._touched;
  }

  constructor(
    private countryCodeData: CountryCode,
    @Optional() @Self() public ngControl: NgControl,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.fetchCountryData();
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this._onTouched();
      this.stateChanges.next();
    });
  }

  ngOnInit() {
    if (this.preferredCountries.length) {
      this.preferredCountries.forEach(iso2 => {
        const preferredCountry = this.allCountries.filter((c) => {
          return c.iso2 === iso2;
        });

        this.preferredCountriesInDropDown.push(preferredCountry[0]);
      });
    }

    if (!this.selectedCountry) {
      if (this.preferredCountriesInDropDown.length) {
        this.selectedCountry = this.preferredCountriesInDropDown[0];
      } else {
        this.selectedCountry = this.allCountries[0];
      }
    }
  }

  checkIfRequired() {
    if (this.required && (!this.phoneNumber || !this.selectedCountry)) {
      this.ngControl.control.setErrors({required: true});
      return this.errorState = true;
    } else if (this.ngControl.control.hasError('required')) {
      this.ngControl.control.setErrors(null);
      return this.errorState = false;
    }
  }

  public onPhoneNumberChange(): void {
    let number = '';
    try {
      number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
    } catch (e) {
    }

    this.propagateChange({
      number: number === '' ? this.phoneNumber : this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL),
      countryCode: this.selectedCountry.iso2.toUpperCase()
    });

    this.checkIfRequired();
  }

  public onCountrySelect(event: MatSelectChange, el: HTMLInputElement): void {
    const { value } = event;
    this.selectedCountry = value;
    if (this.phoneNumber.length > 0) {
      let number = '';
      try {
        number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
      } catch (e) {
      }

      this.propagateChange({
        number: number === '' ? this.phoneNumber : this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL),
        countryCode: this.selectedCountry.iso2.toUpperCase()
      });
    }

    el.focus();
  }

  public onInputKeyPress(event): void {
    const pattern = /[0-9 ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  protected fetchCountryData(): void {
    this.countryCodeData.allCountries.forEach(c => {
      const country = new Country();
      country.name = c[0].toString();
      country.iso2 = c[1].toString();
      country.dialCode = c[2].toString();
      country.priority = +c[3] || 0;
      country.areaCode = +c[4] || null;
      country.flagClass = country.iso2.toLocaleLowerCase();
      this.allCountries.push(country);
    });
  }

  protected getPhoneNumberPlaceHolder(countryCode: string): string {
    try {
      return this.phoneUtil.format(this.phoneUtil.getExampleNumber(countryCode), lpn.PhoneNumberFormat.NATIONAL);
    } catch (e) {
      console.log('CountryCode: "' + countryCode + '" ' + e);
      return e;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    // if (obj) {
    //   this.phoneNumber = obj;
    //   setTimeout(() => {
    //     this.onPhoneNumberChange();
    //   }, 1);
    // }
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }
}
