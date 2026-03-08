import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatKey = 'totalStudents' | 'activeStudents' | 'gradesEntered' | 'pendingApproval';

type StatItem = {
  key: StatKey;
  label: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'red';
  helper?: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent {
  // ✅ source of truth
  private finalStats: Record<StatKey, number> = {
    totalStudents: 1254,
    activeStudents: 1198,
    gradesEntered: 2847,
    pendingApproval: 12,
  };

  // ✅ cards (value pulled from finalStats)
  get stats(): StatItem[] {
    return [
      {
        key: 'totalStudents',
        label: 'Total Students',
        value: this.finalStats.totalStudents,
        icon: 'pi pi-users',
        color: 'blue',
        helper: '+12 this week',
      },
      {
        key: 'activeStudents',
        label: 'Active Students',
        value: this.finalStats.activeStudents,
        icon: 'pi pi-user-plus',
        color: 'green',
        helper: '95.5% active rate',
      },
      {
        key: 'gradesEntered',
        label: 'Grades Entered',
        value: this.finalStats.gradesEntered,
        icon: 'pi pi-book',
        color: 'yellow',
        helper: '92% completion',
      },
      {
        key: 'pendingApproval',
        label: 'Pending Approval',
        value: this.finalStats.pendingApproval,
        icon: 'pi pi-exclamation-triangle',
        color: 'red',
        helper: 'Needs review',
      },
    ];
  }
}