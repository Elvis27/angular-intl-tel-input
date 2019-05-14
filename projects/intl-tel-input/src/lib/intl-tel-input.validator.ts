import {FormControl} from '@angular/forms';
import * as lpn from 'google-libphonenumber';
import { IntlTelInputComponent } from './intl-tel-input.component';

export function phoneNumberValidator(c: IntlTelInputComponent) {
  const err = {
    validatePhoneNumber: {
      valid: false
    }
  };

  if (!c.value) {
    c.errorState = false;
    return null;
  }

  const { number, countryCode } = c.value;
  if (!number || !countryCode) {
    c.errorState = false;
    return null;
  }

  let formattedNumber = null;
  try {
    formattedNumber = lpn.PhoneNumberUtil.getInstance().parse(number, countryCode);
  } catch (e) {
    c.errorState = true;
    return err;
  }

  if (formattedNumber) {
    if (!lpn.PhoneNumberUtil.getInstance().isValidNumber(formattedNumber)) {
      c.errorState = true;
      return err;
    }
  } else {
    c.errorState = true;
    return err;
  }

  c.errorState = false;
  return null;
}
