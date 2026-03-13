import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

import {
  DataTableComponent,
  TableColumn,
  StiTagSeverity,
} from '../../../../shared/components/data-table/data-table.component';

interface Student {
  id: string;
  name: string;
  course: string;
  details: string;
}

interface Grade {
  id: string;
  subject: string;
  subjectCode: string;
  professor: string;
  prelim: string;
  midterm: string;
  finals: string;
  finalGrade: string;
  status: 'in-progress' | 'passed' | 'failed' | 'dropped' | 'incomplete';
  schedule?: string;
  room?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-child-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DataTableComponent],
  templateUrl: './childs-grade.component.html',
})
export class ChildGradeComponent implements OnInit {
  students: Student[] = [
    {
      id: 'hadassa',
      name: 'Hadassa Yap',
      course: 'IT Student',
      details: 'BS Information Technology',
    },
    {
      id: 'john',
      name: 'John Yap',
      course: 'BS Computer Science',
      details: '3rd Year',
    },
    {
      id: 'sarah',
      name: 'Sarah Yap',
      course: 'Senior High School',
      details: 'Grade 12 - STEM',
    },
  ];

  terms: string[] = [
    '2024-2025 2nd Term Tertiary',
    '2024-2025 1st Term Tertiary',
    '2023-2024 2nd Term Tertiary',
    '2023-2024 1st Term Tertiary',
  ];

  selectedStudent = 'hadassa';
  selectedStudentName = 'Hadassa Yap';
  selectedStudentDetails = 'IT Student - BS Information Technology';
  selectedTerm = '2024-2025 2nd Term Tertiary';

  currentGrades: Grade[] = [];

  studentOptions: SelectOption[] = [];
  termOptions: SelectOption[] = [];

  currentGradeColumns: TableColumn<Grade>[] = [
    {
      field: 'subject',
      header: 'Subject',
      valueGetter: (row) => `${row.subject} (${row.subjectCode})`,
    },
    {
      field: 'professor',
      header: 'Professor',
    },
    {
      field: 'prelim',
      header: 'Prelim',
      align: 'center',
    },
    {
      field: 'midterm',
      header: 'Midterm',
      align: 'center',
    },
    {
      field: 'finals',
      header: 'Finals',
      align: 'center',
    },
    {
      field: 'finalGrade',
      header: 'Final Grade',
      align: 'center',
      class: 'font-bold text-blue-600 dark:text-blue-400',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'tag',
      align: 'center',
      tagLabel: (row) => this.getStatusLabel(row.status),
      tagSeverity: (row) => this.getStatusSeverity(row.status),
      tagClass: (row) => this.getStatusClass(row.status),
    },
  ];

  ngOnInit(): void {
    this.studentOptions = this.students.map((student) => ({
      label: `${student.name} - ${student.course}`,
      value: student.id,
    }));

    this.termOptions = this.terms.map((term) => ({
      label: term,
      value: term,
    }));

    this.syncSelectedStudentDisplay();
    this.loadGrades();
  }

  onStudentChange(studentId: string): void {
    this.selectedStudent = studentId;
    this.syncSelectedStudentDisplay();
    this.loadGrades();
  }

  onTermChange(term: string): void {
    this.selectedTerm = term;
    this.loadGrades();
  }

  private syncSelectedStudentDisplay(): void {
    const student = this.students.find((s) => s.id === this.selectedStudent);

    if (student) {
      this.selectedStudentName = student.name;
      this.selectedStudentDetails = `${student.course} - ${student.details}`;
    }
  }

  loadGrades(): void {
    this.currentGrades = this.generateMockGrades();
  }

  generateMockGrades(): Grade[] {
    const subjects = [
      {
        subject: 'Web Development',
        code: 'IT304',
        professor: 'Prof. Santos',
        prelim: '1.50',
        midterm: '1.75',
        finals: '1.50',
        final: '1.50',
        status: 'in-progress' as const,
      },
      {
        subject: 'Database Management',
        code: 'IT302',
        professor: 'Prof. Reyes',
        prelim: '2.00',
        midterm: '2.25',
        finals: '2.00',
        final: '2.00',
        status: 'in-progress' as const,
      },
      {
        subject: 'Network Security',
        code: 'IT401',
        professor: 'Prof. Villanueva',
        prelim: '2.50',
        midterm: '2.50',
        finals: '2.25',
        final: '2.50',
        status: 'in-progress' as const,
      },
      {
        subject: 'Software Engineering',
        code: 'IT405',
        professor: 'Prof. Dela Cruz',
        prelim: '1.75',
        midterm: '1.50',
        finals: '1.75',
        final: '1.75',
        status: 'passed' as const,
      },
      {
        subject: 'Human Computer Interaction',
        code: 'IT306',
        professor: 'Prof. Ramos',
        prelim: '1.50',
        midterm: '1.75',
        finals: '1.50',
        final: '1.50',
        status: 'passed' as const,
      },
      {
        subject: 'Information Assurance',
        code: 'IT402',
        professor: 'Prof. Bautista',
        prelim: '2.25',
        midterm: '2.00',
        finals: '2.25',
        final: '2.25',
        status: 'in-progress' as const,
      },
      {
        subject: 'Mobile Application Development',
        code: 'IT408',
        professor: 'Prof. Lim',
        prelim: '1.75',
        midterm: '1.75',
        finals: '1.50',
        final: '1.75',
        status: 'passed' as const,
      },
      {
        subject: 'Operating Systems',
        code: 'IT203',
        professor: 'Prof. Navarro',
        prelim: '2.50',
        midterm: '2.75',
        finals: '2.50',
        final: '2.50',
        status: 'in-progress' as const,
      },
      {
        subject: 'Data Structures and Algorithms',
        code: 'IT201',
        professor: 'Prof. Flores',
        prelim: '2.00',
        midterm: '2.25',
        finals: '2.00',
        final: '2.00',
        status: 'passed' as const,
      },
      {
        subject: 'Capstone Project',
        code: 'IT499',
        professor: 'Prof. Mendoza',
        prelim: '1.25',
        midterm: '1.50',
        finals: '1.25',
        final: '1.25',
        status: 'in-progress' as const,
      },
    ];

    return subjects.map((subj, index) => ({
      id: `current-${index}`,
      subject: subj.subject,
      subjectCode: subj.code,
      professor: subj.professor,
      prelim: subj.prelim,
      midterm: subj.midterm,
      finals: subj.finals,
      finalGrade: subj.final,
      status: subj.status,
      schedule: 'MWF 10:00 AM - 11:30 AM',
      room: 'RM 204',
    }));
  }

  getStudentInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getStatusSeverity(status: Grade['status']): StiTagSeverity {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'in-progress':
        return 'warn';
      case 'dropped':
        return 'secondary';
      case 'incomplete':
        return 'contrast';
      default:
        return 'secondary';
    }
  }

  getStatusClass(status: Grade['status']): string {
    switch (status) {
      case 'passed':
        return 'sti-status-success';
      case 'failed':
        return 'sti-status-danger';
      case 'in-progress':
        return 'sti-status-warn';
      case 'dropped':
        return 'sti-status-dropped';
      case 'incomplete':
        return 'sti-status-incomplete';
      default:
        return '';
    }
  }

  getStatusLabel(status: Grade['status']): string {
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