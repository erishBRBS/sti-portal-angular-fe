import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SessionUser } from '../../../core/model/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, BadgeModule, TooltipModule, RouterModule],
  templateUrl: './header.component.html',
  styles: [
    `
      :host ::ng-deep .p-avatar.p-avatar-lg {
        width: 2.5rem;
        height: 2.5rem;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() menuClick = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  isDarkMode = false;
  isUserReady = false;

  displayName = '';
  roleLabel = '';
  currentDate = new Date();
  greeting = '';
  avatarUrl = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadLoggedInUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLoggedInUser(): void {
    this.authService.$user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: SessionUser | null) => {
        const firstName = user?.first_name?.trim() || '';
        const lastName = user?.last_name?.trim() || '';
        const fullName = user?.full_name?.trim() || '';
        const username = user?.username?.trim() || '';
        const imagePath = user?.image_path?.trim() || '';
        const roleName = user?.role_name?.trim() || '';

        if (firstName || lastName) {
          this.displayName = `${firstName} ${lastName}`.trim();
        } else if (fullName) {
          this.displayName = fullName;
        } else if (username) {
          this.displayName = username;
        } else {
          this.displayName = '';
        }

        this.roleLabel = roleName || '';

        const fallbackName = this.displayName || 'User';
        const fallbackAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(fallbackName)}`;

        this.avatarUrl = this.authService.$fileAPIUrl + imagePath || fallbackAvatar;

        this.isUserReady = true;
      });
  }

  private setGreeting(): void {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  toggleTheme(): void {
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;

    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    this.isDarkMode = isDark;

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}