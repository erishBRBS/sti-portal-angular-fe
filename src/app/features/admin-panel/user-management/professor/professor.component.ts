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
import { ToastService } from '../../../../shared/services/toast.service';
import { ProfessorService } from '../../../../services/admin-panel/user-management/professor/professor.service';
import { ProfessorModalComponent } from './professor-modal/professor-modal.component';
import { finalize } from 'rxjs';
import { ProfessorData } from '../../../../models/admin-panel/user-management/professor/professor.model';
import {
  DetailModalConfig,
  ViewDetailsComponent,
} from '../../../../shared/components/view-details/view-details.component';
import { createProfessorDetailConfig } from '../../../../helper/professor.helper';

type UserRow = {
  id: number;
  professor_name: string;
  email_address: string;
  mobile_number: string;
  username: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
};

type UserStatus = UserRow['status'];

@Component({
  selector: 'sti-professor',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ProfessorModalComponent, ViewDetailsComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css',
})
export class ProfessorManagementComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'professor_name', header: 'Professor Name', sortable: true, filter: true },
    { field: 'email_address', header: 'Email Address', sortable: true, filter: true },
    { field: 'mobile_number', header: 'Mobile Number', sortable: true, filter: true },
    { field: 'username', header: 'Username', sortable: true, filter: true },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filter: true,
      type: 'tag',
      tagSeverity: (r) =>
        r.status === 'Active' ? 'success' : r.status === 'Pending' ? 'warn' : 'danger',},
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly professorService = inject(ProfessorService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(ProfessorModalComponent) professorModal!: ProfessorModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: UserRow[] = [];

  professorConfig: DetailModalConfig = {
    title: 'Professor Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadProfessor(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.professorModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getProfessorById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteProfessor(e.row.id);
    }
  }

  openImportCsv() {
    if (!this.isBrowser) return;

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

      this.professorService.bulkUploadProfessor(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadProfessor(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message ?? 'Failed to upload professor bulk file.';
          this.toast.error('Error', msg);
        },
      });
    };

    input.click();
  }

  openAddModal() {
    if (!this.isBrowser) return;
    this.professorModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.isBrowser) return;

    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select parent(s) to delete.');
      return;
    }

    if (!confirm('Are you sure you want to delete selected parent(s)?')) {
      return;
    }

    this.deleteSelectedProfessor();
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadProfessor(e.page, e.perPage);
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadProfessor(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadProfessor(page: number, perPage: number) {
    if (!this.isBrowser) return;

    this.loading = true;

    this.professorService
      .getProfessor(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: ProfessorData) => ({
            id: a.id,
            professor_name: a.full_name,
            email_address: a.email,
            mobile_number: a.mobile_number,
            username: a.username,
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

  deleteSelectedProfessor() {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: any) => row.id),
    };

    this.professorService.deleteProfessor(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadProfessor(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parents.';
        this.toast.error('Error', msg);
      },
    });
  }

  deleteProfessor(id: number) {
    if (!this.isBrowser) return;

    const payload = {
      id: [id],
    };

    if (!confirm('Are you sure you want to delete this parent?')) return;

    this.professorService.deleteProfessor(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);
        this.loadProfessor(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parent.';
        this.toast.error('Error', msg);
      },
    });
  }

  private getProfessorById(id: number): void {
    if (!this.isBrowser) return;

    this.professorService.getProfessorById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.professorConfig = createProfessorDetailConfig(
            data,
            this.professorService.fileAPIUrl,
          );
          this.showViewDetails = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load admin details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private mapStatus(status: string): UserStatus {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Pending';
    }
  }
}