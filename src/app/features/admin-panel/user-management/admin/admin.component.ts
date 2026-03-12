import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { AdminService } from '../../../../services/admin-panel/user-management/admin/admin.service';
import { finalize } from 'rxjs';
import { AdminData } from '../../../../models/admin-panel/user-management/admin/admin.model';
import { AdminModalComponent } from './admin-modal/admin-modal.component';
import { ToastService } from '../../../../shared/services/toast.service';

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
  imports: [DataTableComponent, AdminModalComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminManagementComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
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

  @ViewChild(AdminModalComponent) showAdminModalForm!: AdminModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;

  selectedRows: any[] = [];

  ngOnInit(): void {
    this.loadAdmins(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);
    if (e.actionKey === 'edit') {
      this.showAdminModalForm?.updateDialog(e.row.id);
    } else if (e.actionKey === 'view'){

    }
  }

  openImportCsv() {
    console.log('import csv clicked', this.selectedRows);
  }

  openAddModal() {
    this.showAdminModalForm?.showDialog();
  }

  openDeleteModal() {
    console.log("clicked!")
    this.deleteSelectedAdmins();
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadAdmins(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadAdmins(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadAdmins(page: number, perPage: number) {
    this.loading = true;

    this.adminService
      .getAdmins(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
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
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.error('getAdmins failed', err);
          this.rows = [];
        },
      });
  }

  deleteSelectedAdmins(): void {
    const payload = {
      id: this.selectedRows.map((row) => row.id),
    };

    this.adminService.deleteAdmins(payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.onModalSuccess();
        this.selectedRows = [];
      },
      error: (err) => {
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
        return 'Pending'; // or 'Inactive' depende sa backend mo
    }
  }
}
