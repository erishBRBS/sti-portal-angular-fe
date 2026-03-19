import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { StudentService } from '../../../../services/admin-panel/user-management/student/student.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { StudentModalComponent } from './student-modal/student-modal.component';
import { finalize } from 'rxjs';
import { StudentData } from '../../../../models/admin-panel/user-management/student/student.model';
import { DetailModalConfig, ViewDetailsComponent } from '../../../../shared/components/view-details/view-details.component';
import { createStudentDetailConfig } from '../../../../helper/student.helper';

type UserRow = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  course: string;
  rfid_code: string;
  section: string;
  year_level: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
};

type UserStatus = UserRow['status'];
@Component({
  selector: 'sti-student',
  standalone: true,
  imports: [
    DataTableComponent,
    StudentModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
})
export class StudentManagementComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
    { field: 'first_name', header: 'First Name', sortable: true, filter: true },
    { field: 'middle_name', header: 'Middle Name', sortable: true, filter: true },
    { field: 'last_name', header: 'Last Name', sortable: true, filter: true },
    { field: 'email', header: 'Email', sortable: true, filter: true },
    { field: 'contact_number', header: 'Contact Number', sortable: true, filter: true },
    { field: 'course', header: 'Course', sortable: true, filter: true },
    { field: 'section', header: 'Section', sortable: true, filter: true },
    { field: 'rfid_code', header: 'RFID', sortable: true, filter: true },
    { field: 'year_level', header: 'Year Level', sortable: true, filter: true },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filter: true,
      type: 'tag',
      tagSeverity: (r) =>
        r.status === 'Active' ? 'success' : r.status === 'Pending' ? 'warn' : 'danger',
    },
    { field: 'createdAt', header: 'Created', sortable: true, filter: true, type: 'datetime' },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(StudentModalComponent) studentModal!: StudentModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: any[] = [];

  studentConfig: DetailModalConfig = {
    title: 'Student Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadStudent(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

onAction(e: { actionKey: string; row: UserRow }) {

  if (e.actionKey === 'edit') {
    this.studentModal.updateDialog(e.row.id);
  }

  else if (e.actionKey === 'view') {
    this.studentModal.viewDialog(e.row.id);
  }

  else if (e.actionKey === 'delete') {
    this.deleteStudent(e.row.id);
  }

}

openImportCsv() {

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';

  input.onchange = (event: any) => {

    const file: File = event.target.files[0];

    if (!file) return;

    const isCSV = file.name.endsWith('.csv');

    if (!isCSV) {
      this.toast.error('Error', 'Please upload a CSV file');
      return;
    }

    this.studentService.importStudent(file).subscribe({

      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadStudent(this.currentPage, this.rowsPerPage);
      },

      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to import CSV');
      }

    });

  };

  input.click();
}

  openAddModal() {
    this.studentModal?.showDialog();
  }

openDeleteModal() {

  if (!this.selectedRows.length) {
    this.toast.error('Error', 'Please select parent(s) to delete.');
    return;
  }

  if (!confirm('Are you sure you want to delete selected parent(s)?')) {
    return;
  }

  this.deleteSelectedStudent();
}

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadStudent(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadStudent(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadStudent(page: number, perPage: number) {
    this.loading = true;

    this.studentService
      .getStudent(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: StudentData) => ({
            id: a.id,
            first_name: a.first_name,
            middle_name: a.middle_name ?? '',
            last_name: a.last_name,
            email: a.email,
            contact_number: a.contact_number ?? '',
            course: a.course.course_name,
            rfid_code: a.credentials?.rfid_code ?? '',
            section: a.section.section_name,
            year_level: a.year_level,
            status: this.mapStatus(a.status),
            createdAt: a.created_at,
          }));
          queueMicrotask(() => {
            this.currentPage = res.pagination.current_page;
            this.total = res.pagination.total;
            this.first = (res.pagination.current_page - 1) * perPage;
            this.rows = mapped;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.error('getAdmins failed', err);
          this.rows = [];
        },
      });
  }

deleteSelectedStudent() {

  const payload = {
    id: this.selectedRows.map((row: any) => row.id)
  };

  this.studentService.deleteStudent(payload).subscribe({
    next: (res: any) => {
      this.toast.success('Success', res.message);

      // clear selection
      this.selectedRows = [];

      // reload table
      this.loadStudent(this.currentPage, this.rowsPerPage);
    },
    error: (err: any) => {
      const msg = err?.error?.message ?? 'Failed to delete parents.';
      this.toast.error('Error', msg);
    }
  });
  }

    deleteStudent(id: number) {

  const payload = {
    id: [id]
  };

  if (!confirm('Are you sure you want to delete this parent?')) return;

  this.studentService.deleteStudent(payload).subscribe({
    next: (res: any) => {
      this.toast.success('Success', res.message);

      // reload table
      this.loadStudent(this.currentPage, this.rowsPerPage);
    },
    error: (err: any) => {
      const msg = err?.error?.message ?? 'Failed to delete parent.';
      this.toast.error('Error', msg);
    }
  });

}

  private mapStatus(status: string): UserStatus {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Pending'; // or 'Inactive' depende sa backend mo
    }
  }
}
