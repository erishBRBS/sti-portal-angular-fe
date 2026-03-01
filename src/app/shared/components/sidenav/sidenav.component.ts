import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type UserRole = 'admin' | 'professor' | 'teacher' | 'student' | 'parent';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  @Output() navClick = new EventEmitter<void>();

  isAttendanceOpen = true;
  isGradesOpen = false;

  // Admin Panel toggle
  isAdminPanelOpen = false;
  isUserManagementOpen = false;
  isCurriculumManagementOpen = false;

  currentRole: UserRole = 'student';

  get roleLabel(): string {
    const r = String(this.currentRole || '').toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'teacher' || r === 'professor') return 'Faculty';
    if (r === 'student') return 'Student';
    if (r === 'parent') return 'Parent';
    return 'User';
  }

  constructor(private router: Router) {
    if (this.currentRole === 'parent') {
      this.isAttendanceOpen = false;
      this.isGradesOpen = true;
    }
  }

  logout(): void {
    this.router.navigateByUrl('/');
    this.navClick.emit();
  }
}