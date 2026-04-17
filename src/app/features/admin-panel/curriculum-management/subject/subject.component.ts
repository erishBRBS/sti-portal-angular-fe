import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  PLATFORM_ID,
  ViewChild,
  inject,
  NgZone,
} from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { SubjectService } from '../../../../services/admin-panel/curriculum-management/subject.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { SubjectModalComponent } from './subject-modal/subject-modal.component';
import { finalize } from 'rxjs';
import { SubjectData } from '../../../../models/admin-panel/curriculum-management/subject.model';
import { createASubjectDetailConfig } from '../../../../helper/subject-helper';
import { DetailModalConfig } from '../../../../shared/components/view-details/view-details.component';
import { ViewDetailsComponent } from '../../../../shared/components/view-details/view-details.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type UserRow = {
  id: number;
  subject_code: string;
  subject_name: string;
};

@Component({
  selector: 'sti-subject',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SubjectModalComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css',
})
export class SubjectComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'subject_code', header: 'Subject Code', sortable: true, filter: true },
    { field: 'subject_name', header: 'Subject Name', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(SubjectModalComponent) subjectModal!: SubjectModalComponent;

  private readonly subjectService = inject(SubjectService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  showDeleteDialog = false;
  selectedDeleteId: number | null = null;

  selectedRows: UserRow[] = [];

  subjectConfig: DetailModalConfig = {
    title: 'Subject Details',
    showProfile: false,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadSubject(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.subjectModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getSubjectById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteSubject(e.row.id);
    }
  }

  openImportCsv() {
    if (!this.isBrowser) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';

    input.onchange = (event: any) => {
      const file: File = event.target.files[0];

      if (!file) return;

      this.subjectService.bulkUploadSubject(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadSubject(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error', 'Failed to import CSV');
        },
      });
    };

    input.click();
  }

  openAddModal() {
    if (!this.isBrowser) return;
    this.subjectModal.showDialog();
  }

  openDeleteModal() {
    if (!this.isBrowser) return;

    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a subject to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected subjects',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadSubject(e.page, e.perPage);
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadSubject(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadSubject(page: number, perPage: number) {
    if (!this.isBrowser) return;

    this.loading = true;

    this.subjectService
      .getSubject(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: SubjectData) => ({
            id: a.id,
            subject_code: a.subject_code,
            subject_name: a.subject_name,
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
          console.error('getSubject failed', err);
          this.rows = [];
        },
      });
  }

  deleteSubject(id: number) {
    if (!this.isBrowser) return;

    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this section?',
    });
  }

  confirmDelete() {
    if (!this.isBrowser) return;

    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row: UserRow) => row.id),
      };

      this.subjectService.deleteSubject(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadSubject(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete subjects?');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.subjectService.deleteSubject(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadSubject(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete subject');
      },
    });
  }

  handleCancelDelete() {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.selectedDeleteId = null;
  }

  private getSubjectById(id: number): void {
    if (!this.isBrowser) return;

    this.subjectService.getSubjectById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.subjectConfig = createASubjectDetailConfig(
            data,
            this.subjectService.fileAPIUrl,
          );

          this.showViewDetails = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load subject details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  deleteSelectedSubject(): void {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: UserRow) => row.id),
    };

    this.subjectService.deleteSubject(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadSubject(this.currentPage, this.rowsPerPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to delete sections');
      },
    });
  }
}