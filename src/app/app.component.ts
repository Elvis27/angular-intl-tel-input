import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, NgForm} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('form') form: NgForm;
  // form: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    // this.form = this.formBuilder.group({
    //   phoneNumber: new FormControl(null)
    // });

    this.form.valueChanges.subscribe(data => {
      // console.log(data, this.form);
    });
  }
}
