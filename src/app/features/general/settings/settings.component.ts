import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { DialogComponent } from '../../../shared/ui/primeng/dialog/dialog.component';

function matchFields(a: string, b: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const av = control.get(a)?.value;
    const bv = control.get(b)?.value;
    if (!av || !bv) return null;
    return av === bv ? null : { mismatch: true };
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, DialogComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private fb = inject(FormBuilder);

  changePasswordVisible = false;
  isSavingPassword = false;

  changePasswordForm = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFields('newPassword', 'confirmPassword') }
  );

  openChangePassword() {
    this.changePasswordForm.reset();
    this.changePasswordVisible = true;
  }

  closeChangePassword() {
    this.changePasswordVisible = false;
  }

  saveChangePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;

    const payload = this.changePasswordForm.value;
    // TODO: call API here (service)
    // this.settingsService.changePassword(payload).subscribe(() => ...)

    // demo close
    setTimeout(() => {
      this.isSavingPassword = false;
      this.changePasswordVisible = false;
    }, 300);
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  get mismatch() {
    return this.changePasswordForm.errors?.['mismatch'];
  }
}