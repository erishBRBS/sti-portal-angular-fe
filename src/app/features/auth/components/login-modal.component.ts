import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';

type RoleUI = 'Student' | 'Parent' | 'Professor' | 'Admin';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a192f]/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div class="absolute inset-0" (click)="close.emit()"></div>

      <div
        class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-zoomIn95 border border-gray-100"
      >
        <!-- Header -->
        <div class="bg-gradient-to-br from-[#1a4b8c] to-[#2d68b8] p-5 text-center relative">
          <button
            type="button"
            (click)="close.emit()"
            class="absolute top-3 right-3 text-white/50 hover:text-white transition-all"
            aria-label="Close"
          >
            <i class="fas fa-times text-sm"></i>
          </button>

          <div class="w-12 h-12 bg-white rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md">
            <i class="fas fa-user-shield text-[#1a4b8c] text-xl"></i>
          </div>

          <h2 class="text-white font-bold text-base tracking-tight">Portal Login</h2>
        </div>

        <!-- Body -->
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <!-- Roles -->
            <div class="flex bg-gray-100 p-1 rounded-xl mb-4">
              <button
                *ngFor="let r of roles"
                type="button"
                (click)="form.patchValue({ role: r })"
                [class.bg-white]="form.get('role')?.value === r"
                [class.text-[#1a4b8c]]="form.get('role')?.value === r"
                [class.shadow-sm]="form.get('role')?.value === r"
                [class.text-gray-500]="form.get('role')?.value !== r"
                class="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                {{ r }}
              </button>
            </div>

            <div class="space-y-3">
              <!-- Username -->
              <div class="relative">
                <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                <input
                  type="text"
                  formControlName="username"
                  placeholder="Username"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                         text-gray-800 placeholder:text-gray-400 caret-blue-600
                         focus:border-[#1a4b8c] focus:bg-white outline-none transition-all text-sm"
                  [class.border-red-400]="touchedInvalid('username')"
                />
              </div>
              <p *ngIf="touchedInvalid('username')" class="text-[11px] text-red-600 font-semibold -mt-2">
                Username is required.
              </p>

              <!-- Password -->
              <div class="relative">
                <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="Password"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                         text-gray-800 placeholder:text-gray-400 caret-blue-600
                         focus:border-[#1a4b8c] focus:bg-white outline-none transition-all text-sm"
                  [class.border-red-400]="touchedInvalid('password')"
                />
              </div>
              <p *ngIf="touchedInvalid('password')" class="text-[11px] text-red-600 font-semibold -mt-2">
                Password is required.
              </p>
            </div>

            <div class="flex justify-end">
              <a class="text-[11px] font-semibold text-[#1a4b8c] hover:underline cursor-pointer">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              [disabled]="form.invalid || loading"
              class="w-full bg-[#1a4b8c] hover:bg-[#2d68b8] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md transform active:scale-[0.98] transition-all text-sm mt-2 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

            <p *ngIf="message" class="text-center text-emerald-600 text-xs font-semibold mt-2">
              {{ message }}
            </p>

            <p class="text-center text-[11px] text-gray-400 mt-4">
              STI College Bacoor • Smart Student Portal
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  roles: RoleUI[] = ['Student', 'Parent', 'Professor', 'Admin'];
  loading = false;
  message: string | null = null;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['Student' as RoleUI, Validators.required],
    });
  }

  touchedInvalid(name: 'username' | 'password') {
    const c = this.form.get(name);
    return !!(c && c.touched && c.invalid);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // UI-only
    this.loading = true;
    this.message = null;

    setTimeout(() => {
      this.loading = false;
      this.message = 'UI only: login not wired yet.';
    }, 600);
  }
}