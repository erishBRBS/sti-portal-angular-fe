import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type RoleUI = 'Student' | 'Parent' | 'Professor' | 'Admin';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-[9999] bg-[#0a192f]/60"
    >
      <button
        type="button"
        class="absolute inset-0 touch-manipulation"
        (click)="handleClose()"
        aria-label="Close modal backdrop"
      ></button>

      <div
        class="absolute inset-0 overflow-y-auto overscroll-contain p-4 sm:p-6 pointer-events-none"
      >
        <div class="flex min-h-full items-center justify-center">
          <div
            (click)="$event.stopPropagation()"
            class="pointer-events-auto relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl touch-manipulation"
          >
            <div class="relative bg-gradient-to-br from-[#1a4b8c] to-[#2d68b8] p-5 text-center">
              <button
                type="button"
                (click)="handleClose()"
                class="absolute right-3 top-3 rounded-md p-2 text-white/70 transition-all hover:text-white active:scale-95"
                aria-label="Close"
              >
                <i class="fas fa-times text-sm"></i>
              </button>

              <div
                class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md"
              >
                <i class="fas fa-user-shield text-xl text-[#1a4b8c]"></i>
              </div>

              <h2 class="text-base font-bold tracking-tight text-white">
                Portal Login
              </h2>
            </div>

            <div class="p-6">
              <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
                <div class="mb-4 flex rounded-xl bg-gray-100 p-1">
                  <button
                    *ngFor="let r of roles"
                    type="button"
                    (click)="form.patchValue({ role: r })"
                    [class.bg-white]="form.get('role')?.value === r"
                    [class.text-[#1a4b8c]]="form.get('role')?.value === r"
                    [class.shadow-sm]="form.get('role')?.value === r"
                    [class.text-gray-500]="form.get('role')?.value !== r"
                    class="flex-1 rounded-lg py-2 text-[10px] font-bold uppercase transition-all touch-manipulation active:scale-[0.98]"
                  >
                    {{ r }}
                  </button>
                </div>

                <div class="space-y-3">
                  <div class="relative">
                    <i
                      class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                    ></i>
                    <input
                      type="text"
                      formControlName="username"
                      placeholder="Username"
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 caret-blue-600 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a4b8c] focus:bg-white"
                      [class.border-red-400]="touchedInvalid('username')"
                      autocapitalize="none"
                      autocomplete="username"
                      autocorrect="off"
                      spellcheck="false"
                    />
                  </div>

                  <p
                    *ngIf="touchedInvalid('username')"
                    class="-mt-2 text-[11px] font-semibold text-red-600"
                  >
                    Username is required.
                  </p>

                  <div class="relative">
                    <i
                      class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                    ></i>

                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Password"
                      class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-12 text-sm text-gray-800 caret-blue-600 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a4b8c] focus:bg-white"
                      [class.border-red-400]="touchedInvalid('password')"
                      autocomplete="current-password"
                      autocapitalize="none"
                      autocorrect="off"
                      spellcheck="false"
                    />

                    <button
                      type="button"
                      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-2 text-xs text-gray-500 touch-manipulation active:scale-95"
                      (click)="showPassword = !showPassword"
                      aria-label="Toggle password visibility"
                    >
                      <i [ngClass]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>

                  <p
                    *ngIf="touchedInvalid('password')"
                    class="-mt-2 text-[11px] font-semibold text-red-600"
                  >
                    Password is required.
                  </p>
                </div>

                <div class="flex justify-end">
                  <a class="cursor-pointer text-[11px] font-semibold text-[#1a4b8c] hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <p *ngIf="loginError" class="text-center text-xs font-semibold text-red-600">
                  {{ loginError }}
                </p>

                <p *ngIf="message" class="text-center text-xs font-semibold text-emerald-600">
                  {{ message }}
                </p>

                <button
                  type="submit"
                  [disabled]="form.invalid || loading"
                  class="mt-2 w-full rounded-xl bg-[#1a4b8c] py-3 text-sm font-bold text-white shadow-md transition-all touch-manipulation active:scale-[0.98] hover:bg-[#2d68b8] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>

                <p class="mt-4 text-center text-[11px] text-gray-400">
                  STI College Bacoor • Smart Student Portal
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginModalComponent implements OnDestroy {
  private _open = false;
  private lockedScrollY = 0;

  @Input()
  set open(value: boolean) {
    this._open = value;
    this.syncBodyScroll();
  }
  get open(): boolean {
    return this._open;
  }

  @Output() close = new EventEmitter<void>();

  roles: RoleUI[] = ['Student', 'Parent', 'Professor', 'Admin'];
  loading = false;
  message: string | null = null;
  loginError: string | null = null;
  showPassword = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['Student' as RoleUI, Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  touchedInvalid(name: 'username' | 'password') {
    const c = this.form.get(name);
    return !!(c && c.touched && c.invalid);
  }

  handleClose() {
    this.form.reset({
      username: '',
      password: '',
      role: 'Student',
    });
    this.loading = false;
    this.message = null;
    this.loginError = null;
    this.close.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = null;
    this.loginError = null;

    const { username, password, role } = this.form.value;
    const roleParam = String(role).toLowerCase();

    this.authService.login(roleParam, { username, password }).subscribe({
      next: (sessionUser) => {
        this.loading = false;
        this.message = 'Login successful. Redirecting...';

        const roleName = String(sessionUser.role_name || '').toLowerCase();

        this.close.emit();

        if (roleName === 'admin') {
          this.router.navigate(['/ats/admin/dashboard']);
        } else if (roleName === 'student') {
          this.router.navigate(['/ats/student/dashboard']);
        } else if (roleName === 'professor') {
          this.router.navigate(['/ats/professor/dashboard']);
        } else if (roleName === 'parent') {
          this.router.navigate(['/gps/parent/dashboard']);
        } else {
          this.router.navigate(['/']);
        }

        this.form.reset({
          username: '',
          password: '',
          role: 'Student',
        });
      },
      error: (err) => {
        this.loading = false;
        this.loginError =
          err?.error?.message ?? 'Login failed. Please try again.';
      },
    });
  }

  private syncBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this._open) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  private lockBodyScroll(): void {
    this.lockedScrollY = window.scrollY || window.pageYOffset || 0;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const top = document.body.style.top;
    const scrollY = top ? Math.abs(parseInt(top, 10)) : this.lockedScrollY;

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    window.scrollTo(0, scrollY || 0);
  }
}