import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import {
  ActionEvent,
  DataTableComponent,
  TableColumn,
  RowAction,
} from '../../../../shared/components/data-table/data-table.component';

interface SelectOption {
  label: string;
  value: string;
}

interface SubjectOption {
  id: string;
  code: string;
  name: string;
  label: string;
}

interface StudentGradeRow {
  id: number;
  student_name: string;
  prelim: number;
  midterm: number;
  pre_finals: number;
  finals: number;
  final_grade: string;
  academic_year: string;
  subject_id: string;
}

@Component({
  selector: 'app-grade-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DataTableComponent],
  templateUrl: './grade-management.component.html',
})
export class GradeManagementComponent {
  selectedAcademicYear = '2025-2026-2';
  selectedSubject = 'web101';

  tableRows = 5;
  rowsPerPageOptions = [5, 10, 25, 50];
  tableFirst = 0;

  academicYearOptions: SelectOption[] = [
    { label: 'A.Y. 2025-2026 | 1st Semester', value: '2025-2026-1' },
    { label: 'A.Y. 2025-2026 | 2nd Semester', value: '2025-2026-2' },
    { label: 'A.Y. 2024-2025 | 2nd Semester', value: '2024-2025-2' },
  ];

  subjectOptions: SubjectOption[] = [
    {
      id: 'web101',
      code: 'WEB101',
      name: 'Web Development',
      label: 'WEB101 - Web Development',
    },
    {
      id: 'ias201',
      code: 'IAS201',
      name: 'Information Assurance & Security',
      label: 'IAS201 - Information Assurance & Security',
    },
    {
      id: 'cap301',
      code: 'CAP301',
      name: 'IT Capstone Project 1',
      label: 'CAP301 - IT Capstone Project 1',
    },
  ];

  allGrades: StudentGradeRow[] = [
    {
      id: 1,
      student_name: 'Hadassa Yap',
      prelim: 89,
      midterm: 90,
      pre_finals: 91,
      finals: 93,
      final_grade: '1.75',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 2,
      student_name: 'John Cruz',
      prelim: 85,
      midterm: 87,
      pre_finals: 88,
      finals: 90,
      final_grade: '2.00',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 3,
      student_name: 'Maria Santos',
      prelim: 91,
      midterm: 92,
      pre_finals: 90,
      finals: 94,
      final_grade: '1.50',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 4,
      student_name: 'Mark Tan',
      prelim: 87,
      midterm: 88,
      pre_finals: 89,
      finals: 90,
      final_grade: '2.00',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 5,
      student_name: 'Paula Ramos',
      prelim: 90,
      midterm: 91,
      pre_finals: 92,
      finals: 93,
      final_grade: '1.75',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 6,
      student_name: 'Anne Dela Cruz',
      prelim: 93,
      midterm: 95,
      pre_finals: 94,
      finals: 96,
      final_grade: '1.25',
      academic_year: '2025-2026-2',
      subject_id: 'web101',
    },
    {
      id: 7,
      student_name: 'Kevin Reyes',
      prelim: 88,
      midterm: 84,
      pre_finals: 86,
      finals: 85,
      final_grade: '2.25',
      academic_year: '2025-2026-2',
      subject_id: 'ias201',
    },
    {
      id: 8,
      student_name: 'Lara Mendoza',
      prelim: 92,
      midterm: 91,
      pre_finals: 93,
      finals: 94,
      final_grade: '1.50',
      academic_year: '2025-2026-2',
      subject_id: 'ias201',
    },
    {
      id: 9,
      student_name: 'Noel Garcia',
      prelim: 86,
      midterm: 87,
      pre_finals: 85,
      finals: 88,
      final_grade: '2.25',
      academic_year: '2025-2026-2',
      subject_id: 'cap301',
    },
    {
      id: 10,
      student_name: 'Bianca Flores',
      prelim: 95,
      midterm: 96,
      pre_finals: 94,
      finals: 97,
      final_grade: '1.25',
      academic_year: '2025-2026-2',
      subject_id: 'cap301',
    },
  ];

  gradeColumns: TableColumn<StudentGradeRow>[] = [
    {
      field: 'student_name',
      header: 'Student Name',
      sortable: true,
      filter: true,
      width: '24rem',
    },
    {
      field: 'prelim',
      header: 'Prelim',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'midterm',
      header: 'Midterm',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'pre_finals',
      header: 'Pre-Finals',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'finals',
      header: 'Finals',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'final_grade',
      header: 'Final Grade',
      sortable: true,
      align: 'center',
      width: '10rem',
    },
  ];

  gradeActions: RowAction<StudentGradeRow>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: 'pi pi-pencil',
      tooltip: 'Edit grade',
      buttonClass: 'text-blue-600',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      tooltip: 'Delete record',
      buttonClass: 'text-red-600',
    },
  ];

  get selectedSubjectData(): SubjectOption | undefined {
    return this.subjectOptions.find((subject) => subject.id === this.selectedSubject);
  }

  get selectedSubjectTitle(): string {
    return this.selectedSubjectData?.label ?? 'Select subject';
  }

  get filteredGrades(): StudentGradeRow[] {
    return this.allGrades.filter(
      (item) =>
        item.academic_year === this.selectedAcademicYear &&
        item.subject_id === this.selectedSubject
    );
  }

  onAcademicYearChange(value: string): void {
    this.selectedAcademicYear = value;
    this.tableFirst = 0;
  }

  onSubjectChange(value: string): void {
    this.selectedSubject = value;
    this.tableFirst = 0;
  }

  onTableAction(event: ActionEvent<StudentGradeRow>): void {
    if (event.actionKey === 'edit') {
      console.log('Edit row:', event.row);
      return;
    }

    if (event.actionKey === 'delete') {
      console.log('Delete row:', event.row);
    }
  }

  onAddGrade(): void {
    console.log('Add grade clicked');
  }
}