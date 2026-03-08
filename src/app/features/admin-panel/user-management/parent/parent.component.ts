import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { DataTableComponent, RowAction, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ParentService } from '../../../../services/admin-panel/user-management/parent/parent.service';
import { ParentModalComponent } from './parent-modal/parent-modal.component';
import { finalize } from 'rxjs';
import { ParentData } from '../../../../models/admin-panel/user-management/parent/parent.model';

type UserRow = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
};

type UserStatus = UserRow['status'];
@Component({
  selector: 'sti-parent',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.css',
})
export class ParentManagementComponent {
 cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
    { field: 'first_name', header: 'First Name', sortable: true, filter: true },
    { field: 'middle_name', header: 'Middle Name', sortable: true, filter: true },
    { field: 'last_name', header: 'Last Name', sortable: true, filter: true },
    { field: 'email', header: 'Email', sortable: true, filter: true },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filter: true,
      type: 'tag',
      tagSeverity: (r) =>
        r.status === 'Active' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger',
    },
    { field: 'createdAt', header: 'Created', sortable: true, filter: true, type: 'datetime' },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly parentService = inject(ParentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  @ViewChild(ParentModalComponent) showStudentModalForm!: ParentModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;

  selectedRows: any[] = [];

  ngOnInit(): void {
    this.loadParent(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);
    if (e.actionKey === 'edit') {
      // this.showAdminModalForm?.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
    }
  }

  openImportCsv() {
    console.log('import csv clicked', this.selectedRows);
  }

  openAddModal() {
    // this.showAdminModalForm?.showDialog();
  }

  openDeleteModal() {
    console.log('clicked!');
    // this.deleteSelectedAdmins();
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadParent(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadParent(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadParent(page: number, perPage: number) {
    this.loading = true;

    this.parentService
      .getParent(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
         const mapped = res.data.map((a: ParentData) => ({
            id: a.id,
            first_name: a.first_name,
            middle_name: a.middle_name ?? '',
            last_name: a.last_name,
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

  deleteSelectedStudent(): void {
    // const payload = {
    //   id: this.selectedRows.map((row) => row.id),
    // };

    // this.adminService.deleteAdmins(payload).subscribe({
    //   next: (res) => {
    //     console.log(res.message);
    //     this.toast.success('Success', res.message);
    //     this.onModalSuccess();
    //     this.selectedRows = [];
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   },
    // });
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
