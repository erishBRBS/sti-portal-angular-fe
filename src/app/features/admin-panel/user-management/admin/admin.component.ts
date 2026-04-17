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
import { AdminService } from '../../../../services/admin-panel/user-management/admin/admin.service';
import { AdminData } from '../../../../models/admin-panel/user-management/admin/admin.model';
import { AdminModalComponent } from './admin-modal/admin-modal.component';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  DetailModalConfig,
  ViewDetailsComponent,
} from '../../../../shared/components/view-details/view-details.component';
import { createAdminDetailConfig } from '../../../../helper/admin-helper';

type UserRow = {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
};

type UserStatus = UserRow['status'];

@Component({
  selector: 'sti-admin',
  standalone: true,
  imports: [CommonModule, DataTableComponent, AdminModalComponent, ViewDetailsComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminManagementComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'name', header: 'Full Name', sortable: true, filter: true },
    { field: 'email', header: 'Email', sortable: true, filter: true },
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

  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(AdminModalComponent) showAdminModalForm!: AdminModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: UserRow[] = [];

  adminConfig: DetailModalConfig = {
    title: 'Admin Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadAdmins(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);

    if (e.actionKey === 'edit') {
      this.showAdminModalForm?.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getAdminById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteAdmins(e.row.id);
    }
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

    this.deleteSelectedAdmins();
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadAdmins(e.page, e.perPage);
  }

  openImportCsv() {
    if (!this.isBrowser) return;

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

      this.adminService.importAdmin(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadAdmins(this.currentPage, this.rowsPerPage);
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
    this.showAdminModalForm?.showDialog();
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadAdmins(this.currentPage, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadAdmins(page: number, perPage: number): void {
    if (!this.isBrowser) return;

    this.loading = true;

    this.adminService.getAdmins(page, perPage).subscribe({
      next: (res) => {
        const mapped = res.data.map((a: AdminData) => ({
          id: a.id,
          name: a.full_name,
          email: a.email,
          status: this.mapStatus(a.status),
          createdAt: a.created_at,
        }));

        queueMicrotask(() => {
          this.currentPage = res.pagination.current_page;
          this.total = res.pagination.total;
          this.first = (res.pagination.current_page - 1) * perPage;
          this.rows = mapped;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('getAdmins failed', err);

        queueMicrotask(() => {
          this.rows = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  deleteSelectedAdmins(): void {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row) => row.id),
    };

    this.adminService.deleteAdmins(payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.selectedRows = [];
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  deleteSelectedAdmin() {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: any) => row.id),
    };

    this.adminService.deleteAdmins(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadAdmins(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parents.';
        this.toast.error('Error', msg);
      },
    });
  }

  deleteAdmins(id: number) {
    if (!this.isBrowser) return;

    const payload = {
      id: [id],
    };

    if (!confirm('Are you sure you want to delete this parent?')) return;

    this.adminService.deleteAdmins(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);
        this.loadAdmins(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parent.';
        this.toast.error('Error', msg);
      },
    });
  }

  private getAdminById(id: number): void {
    if (!this.isBrowser) return;

    this.adminService.getAdminById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.adminConfig = createAdminDetailConfig(data, this.adminService.fileAPIUrl);
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