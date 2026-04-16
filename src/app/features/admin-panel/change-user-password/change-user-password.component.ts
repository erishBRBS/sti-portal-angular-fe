import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChangeUserPasswordService } from '../../../services/admin-panel/change-user-password/change-user-password.service';import { ChangeUserPasswordPayload } from '../../../payloads/admin-panel/change-user-password/change-user-password.payload';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-user-password.component.html',
})
export class ChangeUserPasswordComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private changeUserPasswordService = inject(ChangeUserPasswordService);
  private toast = inject(ToastService);

  currentDate = '';

  searchForm: FormGroup;
  resetForm: FormGroup;

  isSearching = false;
  isResetting = false;
  showResetSection = false;
  adminName = '';

  passwordStrength = 0;
  passwordStrengthClass = '';

  isDarkTheme = false;

  private selectedIdentifier: { username?: string; email?: string } = {};

  constructor() {
    this.searchForm = this.fb.group({
      searchQuery: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.resetForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.setCurrentDate();
    this.loadThemePreference();
  }

  ngOnDestroy(): void {}

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  setCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    this.currentDate = now.toLocaleDateString('en-US', options);
  }

  loadThemePreference(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  searchAdmin(): void {
    if (this.searchForm.invalid) {
      this.toast.error('Error', 'Please enter a username or email address to search.');
      return;
    }

    const rawQuery = String(this.searchForm.get('searchQuery')?.value ?? '').trim();

    if (!rawQuery) {
      this.toast.error('Error', 'Please enter a username or email address to search.');
      return;
    }

    this.isSearching = true;

    const isEmail = this.isEmail(rawQuery);

    this.selectedIdentifier = isEmail
      ? { email: rawQuery }
      : { username: rawQuery };

    this.adminName = rawQuery;
    this.showResetSection = true;

    this.toast.success('Success', `Ready to reset password for ${rawQuery}.`);

    setTimeout(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const element = document.getElementById('resetSection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      this.isSearching = false;
      this.cdr.detectChanges();
    }, 100);
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      if (this.resetForm.get('newPassword')?.errors?.['required']) {
        this.toast.error('Error', 'Password is required.');
      } else if (this.resetForm.get('newPassword')?.errors?.['minlength']) {
        this.toast.error('Error', 'Password must be at least 8 characters long.');
      } else if (this.resetForm.get('newPassword')?.errors?.['pattern']) {
        this.toast.error(
          'Error',
          'Password must contain uppercase, lowercase, number and special character.'
        );
      } else if (this.resetForm.errors?.['passwordMismatch']) {
        this.toast.error('Error', 'Passwords do not match.');
      }
      return;
    }

    if (!this.selectedIdentifier.username && !this.selectedIdentifier.email) {
      this.toast.error('Error', 'Please search for a username or email first.');
      return;
    }

    const payload: ChangeUserPasswordPayload = {
      ...this.selectedIdentifier,
      new_password: this.resetForm.get('newPassword')?.value ?? '',
      new_password_confirmation: this.resetForm.get('confirmPassword')?.value ?? '',
    };

    this.isResetting = true;

    this.changeUserPasswordService.resetUserPassword(payload).subscribe({
      next: (res) => {
        this.isResetting = false;
        this.toast.success('Success', res?.message || `Password successfully reset for ${this.adminName}.`);

        this.resetForm.reset();
        this.passwordStrength = 0;
        this.passwordStrengthClass = '';

        setTimeout(() => {
          this.showResetSection = false;
          this.adminName = '';
          this.selectedIdentifier = {};
          this.searchForm.reset();
          this.cdr.detectChanges();
        }, 1200);

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isResetting = false;
        this.toast.error('Error', this.extractErrorMessage(err));
        this.cdr.detectChanges();
      },
    });
  }

  checkPasswordStrength(): void {
    const password = this.resetForm.get('newPassword')?.value || '';
    let strength = 0;

    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (requirements.length) strength += 20;
    if (requirements.lowercase) strength += 20;
    if (requirements.uppercase) strength += 20;
    if (requirements.numbers) strength += 20;
    if (requirements.special) strength += 20;

    this.passwordStrength = strength;

    if (strength <= 40) {
      this.passwordStrengthClass = 'weak';
    } else if (strength <= 80) {
      this.passwordStrengthClass = 'medium';
    } else {
      this.passwordStrengthClass = 'strong';
    }
  }

  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    const errors = err?.error?.errors;
    if (errors) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey].length) {
        return errors[firstKey][0];
      }
    }

    return 'Failed to reset password.';
  }
}