import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { SessionUser } from '../../../core/model/auth.model';

type UserRole = 'admin' | 'professor' | 'teacher' | 'student' | 'parent';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent implements OnDestroy {
  @Output() navClick = new EventEmitter<void>();
  private $destroy = new Subject<void>();

  isAttendanceOpen = true;
  isGradesOpen = true;

  isAdminPanelOpen = false;
  isUserManagementOpen = false;
  isCurriculumManagementOpen = false;

  currentRole: UserRole = 'student';

  $user: Observable<SessionUser | null>;
  $roleLabel: Observable<string>;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.$user = this.authService.$user;

    this.$roleLabel = this.$user.pipe(
      map((u: SessionUser | null) => {
        const r = String(u?.role_name || '').toLowerCase();
        if (r === 'admin') return 'Admin';
        if (r === 'professor') return 'Professor';
        if (r === 'student') return 'Student';
        if (r === 'parent') return 'Parent';
        return 'User';
      }),
    );

    this.$user.pipe(takeUntil(this.$destroy)).subscribe((u: SessionUser | null) => {
      const role = String(u?.role_name || '').toLowerCase();

      if (role === 'parent') {
        this.isAttendanceOpen = false;
        this.isGradesOpen = true;
        return;
      }

      this.isAttendanceOpen = true;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  isRole(role: string): boolean {
    const r = String(this.authService.currentUser?.role_name || '').toLowerCase();
    return r === role.toLowerCase();
  }

  canSeeAttendancePortal(): boolean {
    const r = String(this.authService.currentUser?.role_name || '').toLowerCase();
    return r === 'admin' || r === 'professor' || r === 'student';
  }

  canSeeAdminPanel(): boolean {
    const r = String(this.authService.currentUser?.role_name || '').toLowerCase();
    return r === 'admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}