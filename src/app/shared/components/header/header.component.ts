import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SessionUser } from '../../../core/model/auth.model';
import { AnnouncementService } from '../../../services/general/announcement.service';

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
  hasUnreadNotifications = false;

  displayName = '';
  roleLabel = '';
  currentDate = new Date();
  greeting = '';
  avatarUrl = '';
  userKey = 'guest';

  constructor(
    private authService: AuthService,
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.setGreeting();

    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }

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
        this.userKey = username || this.displayName || 'guest';

        const fallbackName = this.displayName || 'User';
        const fallbackAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(fallbackName)}`;

        this.avatarUrl = imagePath
          ? this.authService.$fileAPIUrl + imagePath
          : fallbackAvatar;

        this.isUserReady = true;

        if (isPlatformBrowser(this.platformId)) {
          this.checkUnreadAnnouncements();
        }

        this.cdr.detectChanges();
      });
  }

  private getAnnouncementSeenKey(): string {
    return `announcement_seen_at_${this.userKey}`;
  }

  private checkUnreadAnnouncements(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.announcementService.getAnnouncement(1, 1).subscribe({
      next: (res: any) => {
        const latest = Array.isArray(res?.data) ? res.data[0] : null;

        if (!latest?.created_at) {
          this.hasUnreadNotifications = false;
          this.cdr.detectChanges();
          return;
        }

        const latestCreatedAt = new Date(latest.created_at).getTime();
        const seenAt = localStorage.getItem(this.getAnnouncementSeenKey());
        const seenTime = seenAt ? new Date(seenAt).getTime() : 0;

        this.hasUnreadNotifications = latestCreatedAt > seenTime;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to check unread announcements:', err);
        this.hasUnreadNotifications = false;
        this.cdr.detectChanges();
      },
    });
  }

  onNotificationClick(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.getAnnouncementSeenKey(), new Date().toISOString());
    }

    this.hasUnreadNotifications = false;
    this.cdr.detectChanges();

    this.router.navigate(['general/notifications']);
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

  private loadTheme(): void {
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;

    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');

    this.isDarkMode = isDark;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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