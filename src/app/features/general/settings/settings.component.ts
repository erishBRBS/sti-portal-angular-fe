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
import { ToastService } from '../../../shared/services/toast.service';
import { SettingsService } from '../../../services/general/change-password.service';
import { ChangePasswordPayload } from '../../../payloads/general/settings/change-password.payload';

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
  private settingsService = inject(SettingsService);

  changePasswordVisible = false;
  isSavingPassword = false;

  constructor(private toast: ToastService) {}

  changePasswordForm = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFields('newPassword', 'confirmPassword') }
  );

  openChangePassword(): void {
    this.changePasswordForm.reset();
    this.changePasswordVisible = true;
  }

  closeChangePassword(): void {
    this.changePasswordVisible = false;
  }

  saveChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;

    const payload: ChangePasswordPayload = {
      new_password: this.changePasswordForm.get('newPassword')?.value ?? '',
      new_password_confirmation:
        this.changePasswordForm.get('confirmPassword')?.value ?? '',
    };

    this.settingsService.changePassword(payload).subscribe({
      next: (response) => {
        this.isSavingPassword = false;
        this.changePasswordVisible = false;
        this.changePasswordForm.reset();

        this.toast.success(
          'Success',
          response?.message || 'Password updated successfully.'
        );
      },
      error: (err) => {
        this.isSavingPassword = false;

        const message =
          err?.error?.message ||
          err?.error?.errors?.new_password?.[0] ||
          'Failed to update password.';

        this.toast.error('Error', message);
      },
    });
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  get mismatch() {
    return this.changePasswordForm.errors?.['mismatch'];
  }
}