import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParentDashboardStateService {
  private readonly key = 'parent_selected_student';

  getSelectedStudent(): string {
    return sessionStorage.getItem(this.key) || '';
  }

  setSelectedStudent(studentId: string): void {
    sessionStorage.setItem(this.key, studentId);
  }

  clear(): void {
    sessionStorage.removeItem(this.key);
  }
}