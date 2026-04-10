import { ChangeDetectorRef, Component, ViewChild, inject } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentParentService } from '../../../../services/admin-panel/association/student-parent.service';
import { StudentParentModalComponent } from './student-parent-modal/student-parent-modal.component';

type StudentParentRow = {
  id: number;
  student_name: string;
  parent_name: string;
};

@Component({
  selector: 'sti-student-parent',
  standalone: true,
  imports: [DataTableComponent, StudentParentModalComponent, ConfirmDialogComponent],
  templateUrl: './student-parent.component.html',
})
export class StudentParentComponent {
  cols: TableColumn<StudentParentRow>[] = [
    { field: 'student_name', header: 'Student', sortable: true, filter: true },
    { field: 'parent_name', header: 'Parent', sortable: true, filter: true },
  ];

  actions: RowAction<StudentParentRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly studentParentService = inject(StudentParentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(StudentParentModalComponent) studentParentModal!: StudentParentModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: StudentParentRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  selectedRows: StudentParentRow[] = [];
  selectedDeleteId: number | null = null;

  ngOnInit(): void {
    this.loadStudentParent(1, this.rowsPerPage);
  }

  onRow(row: StudentParentRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: StudentParentRow }) {
    if (e.actionKey === 'view') {
      this.studentParentModal.viewDialog(e.row.id);
    } else if (e.actionKey === 'edit') {
      this.studentParentModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteStudentParent(e.row.id);
    }
  }

  openImportCsv() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      const fileName = file.name.toLowerCase();
      const isValidFile =
        fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      if (!isValidFile) {
        this.toast.error('Error', 'Please upload a CSV or Excel file.');
        return;
      }

      this.studentParentService.bulkUploadStudentParent(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadStudentParent(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message ?? 'Failed to upload student-parent bulk file.';
          this.toast.error('Error', msg);
        },
      });
    };

    input.click();
  }

  openAddModal() {
    this.studentParentModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a record to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected student-parent assignments?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadStudentParent(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadStudentParent(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Student-parent form cancelled');
  }

  loadStudentParent(page: number, perPage: number) {
    this.loading = true;

    this.studentParentService
      .getStudentParent(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: any) => ({
            id: a.id,
            student_name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim(),
            parent_name: `${a.parent?.first_name ?? ''} ${a.parent?.last_name ?? ''}`.trim(),
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
          console.error('getStudentParent failed', err);
          this.rows = [];
        },
      });
  }

  deleteStudentParent(id: number) {
    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this student-parent assignment?',
    });
  }

  confirmDelete() {
    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row: StudentParentRow) => row.id),
      };

      this.studentParentService.deleteStudentParent(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadStudentParent(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete selected records');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.studentParentService.deleteStudentParent(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadStudentParent(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete record');
      },
    });
  }

  handleCancelDelete() {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }
}
