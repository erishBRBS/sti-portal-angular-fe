import { Component } from '@angular/core';
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
  isAttendanceOpen = true;
  isGradesOpen = false;

  // ✅ TEMP: palitan mo nalang kapag may auth ka na
  currentRole: UserRole = 'student';

  // For UI label sa sidebar header
  get roleLabel(): string {
    const r = String(this.currentRole || '').toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'teacher' || r === 'professor') return 'Faculty';
    if (r === 'student') return 'Student';
    if (r === 'parent') return 'Parent';
    return 'User';
  }

  constructor(private router: Router) {
    // ✅ mimic your old behavior: parents default open grades
    if (this.currentRole === 'parent') {
      this.isAttendanceOpen = false;
      this.isGradesOpen = true;
    }
  }

  isRole(role: string): boolean {
    return String(this.currentRole).toLowerCase() === role.toLowerCase();
  }

  canSeeAttendancePortal(): boolean {
    const r = String(this.currentRole).toLowerCase();
    return r === 'admin' || r === 'professor' || r === 'teacher' || r === 'student';
  }

  logout(): void {
    // ✅ TEMP: kapag may auth ka na, dito mo tatawagin logout()
    this.router.navigateByUrl('/');
  }
}