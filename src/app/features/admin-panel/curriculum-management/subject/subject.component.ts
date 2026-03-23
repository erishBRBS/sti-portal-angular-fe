import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
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

type UserRow = {
  id: number;
  subject_code: string;
  subject_name: string;
};
@Component({
  selector: 'sti-subject',
  standalone: true,
  imports: [DataTableComponent, SubjectModalComponent, ViewDetailsComponent ],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css',
})
export class SubjectComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
    { field: 'subject_code', header: 'Subject Code', sortable: true, filter: true },
    { field: 'subject_name', header: 'Subject Name', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly subjectService = inject(SubjectService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(SubjectModalComponent) subjectModal!: SubjectModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: any[] = [];

subjectConfig: DetailModalConfig = {
  title: 'Subject Details',
  showProfile: false,
  profileImage: '',
  fields: [],
};

  ngOnInit(): void {
    this.loadSubject(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

onAction(e: { actionKey: string; row: UserRow }) {

  if (e.actionKey === 'edit') {
    this.subjectModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      // optional view function
      this.getSubjectById(e.row.id);
    }

  else if (e.actionKey === 'delete') {
    this.deleteSubject(e.row.id);
  }

}

openImportCsv() {

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';

  input.onchange = (event: any) => {
    const file: File = event.target.files[0];

    if (!file) return;

    this.subjectService.importSubject(file).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadSubject(this.currentPage, this.rowsPerPage);
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
  this.subjectModal.showDialog();
}

openDeleteModal() {
  if (!this.selectedRows.length) {
    this.toast.error('Error', 'Please select a section to delete.');
    return;
  }

  if (!confirm('Are you sure you want to delete selected section(s)?')) {
    return;
  }

  this.deleteSelectedSubject();
}


  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadSubject(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadSubject(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadSubject(page: number, perPage: number) {
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
          console.error('getAdmins failed', err);
          this.rows = [];
        },
      });
  }
  deleteSubject(id: number) {
  const payload = {
    id: [id]
  };

  if (!confirm('Are you sure you want to delete this section?')) return;

  this.subjectService.deleteSubject(payload).subscribe({
    next: (res) => {
      this.toast.success('Success', res.message);
      this.loadSubject(this.currentPage, this.rowsPerPage);
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Error', 'Failed to delete section');
    }
  });
}

private getSubjectById(id: number): void {
  this.subjectService.getSubjectById(id).subscribe({
    next: (response) => {
      const data = response.data;

      this.ngZone.run(() => {
        this.subjectConfig = createASubjectDetailConfig(
          data,
          this.subjectService.fileAPIUrl // or '' if wala
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

  const payload = {
    id: this.selectedRows.map((row: UserRow) => row.id)
  };

  this.subjectService.deleteSubject(payload).subscribe({
    next: (res) => {
      this.toast.success('Success', res.message);

      // clear selection
      this.selectedRows = [];

      // reload table
      this.loadSubject(this.currentPage, this.rowsPerPage);
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Error', 'Failed to delete sections');
    }
  });

}
}
