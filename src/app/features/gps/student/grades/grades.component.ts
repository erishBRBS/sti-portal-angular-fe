import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

interface TermOption {
  label: string;
  value: string;
}

interface GradeCard {
  subject: string;
  professorName: string;
  date: string;
  prelim: string;
  midterm: string;
  preFinals: string;
  finals: string;
  average: string;
  finalGrade: string;
  status: 'in-progress' | 'passed' | 'failed' | 'dropped' | 'incomplete';
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DialogModule],
  templateUrl: './grades.component.html',
})
export class GradeComponent implements OnInit {
  selectedYear = '2024-2025';
  showGradingSystemModal = false;

  years: TermOption[] = [
    { label: 'A.Y. 2024-2025', value: '2024-2025' },
    { label: 'A.Y. 2023-2024', value: '2023-2024' },
  ];

  termGpa = '2.25';
  gradeCards: GradeCard[] = [];

  gradingSystem = [
    '1.00 (97.5-100%) Excellent',
    '1.25 (94.5-97.49%) Very Good',
    '1.50 (91.5-94.49%) Very Good',
    '1.75 (88.5-91.49%) Very Good',
    '2.00 (85.5-88.49%) Satisfactory',
    '2.25 (81.5-85.49%) Satisfactory',
    '2.50 (77.5-81.49%) Satisfactory',
    '2.75 (73.5-77.49%) Fair',
    '3.00 (69.5-73.49%) Fair',
    '5.00 (Below 69.5%) Failed',
    'DRP (Officially Dropped)',
    'INC (Incomplete Req.)',
  ];

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.gradeCards = [
      {
        subject: 'Great Books',
        professorName: 'L. MANALAYSAY',
        date: '17 JUN, 2025',
        prelim: '82.00',
        midterm: '82.67',
        preFinals: '90.67',
        finals: '89.33',
        average: '86.17',
        finalGrade: '2.00',
        status: 'passed',
      },
      {
        subject: 'Information Assurance & Security',
        professorName: 'J. GUEVARRA',
        date: '16 JUN, 2025',
        prelim: '89.00',
        midterm: '66.15',
        preFinals: '87.20',
        finals: '80.00',
        average: '80.59',
        finalGrade: '2.50',
        status: 'passed',
      },
      {
        subject: 'IT Capstone Project 1',
        professorName: 'R. CAMPOSAGRADO',
        date: '16 JUN, 2025',
        prelim: '92.00',
        midterm: '88.00',
        preFinals: '85.00',
        finals: '87.20',
        average: '88.05',
        finalGrade: '2.00',
        status: 'passed',
      },
      {
        subject: 'Web Systems and Technologies',
        professorName: 'E. ENERLAN',
        date: '16 JUN, 2025',
        prelim: '72.67',
        midterm: '77.42',
        preFinals: '86.00',
        finals: '91.33',
        average: '81.86',
        finalGrade: '2.25',
        status: 'passed',
      },
      {
        subject: 'Discrete Mathematics',
        professorName: 'M. DELA CRUZ',
        date: '15 JUN, 2025',
        prelim: '70.00',
        midterm: '72.50',
        preFinals: '74.00',
        finals: '75.00',
        average: '72.88',
        finalGrade: '3.00',
        status: 'passed',
      },
    ];
  }

  openGradingSystemModal(): void {
    this.showGradingSystemModal = true;
  }

  getStatusBadgeClass(status: GradeCard['status']): string {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500 text-white';
      case 'failed':
        return 'bg-rose-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'dropped':
        return 'bg-slate-500 text-white';
      case 'incomplete':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  }

  getStatusLabel(status: GradeCard['status']): string {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'dropped':
        return 'Dropped';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status;
    }
  }
}