import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ParentService } from '../../../../services/admin-panel/user-management/parent/parent.service';
import { ParentModalComponent } from './parent-modal/parent-modal.component';
import { finalize } from 'rxjs';
import { ParentData } from '../../../../models/admin-panel/user-management/parent/parent.model';
import { ModalMode } from '../../../../enums/modal.mode';
import {
  DetailModalConfig,
  ViewDetailsComponent,
} from './../../../../shared/components/view-details/view-details.component';
import { createParentDetailConfig } from '../../../../helper/parent.helper';

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
  imports: [DataTableComponent, ParentModalComponent, ViewDetailsComponent],
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
  private readonly ngZone = inject(NgZone);

  @ViewChild(ParentModalComponent) parentModal!: ParentModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: any[] = [];

  parentConfig: DetailModalConfig = {
    title: 'Parent Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadParent(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.parentModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getParentById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteParent(e.row.id);
    }
  }

  openImportCsv() {
    console.log('import csv clicked');
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

      this.parentService.bulkUploadParent(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadParent(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message ?? 'Failed to upload parent bulk file.';
          this.toast.error('Error', msg);
        },
      });
    };
    input.click();
  }

  openAddModal() {
    this.parentModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select parent(s) to delete.');
      return;
    }

    if (!confirm('Are you sure you want to delete selected parent(s)?')) {
      return;
    }

    this.deleteSelectedParents();
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
          console.error('getParents failed', err);
          this.rows = [];
        },
      });
  }

  deleteSelectedParents() {
    const payload = {
      id: this.selectedRows.map((row: any) => row.id),
    };

    this.parentService.deleteParent(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);

        // clear selection
        this.selectedRows = [];

        // reload table
        this.loadParent(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parents.';
        this.toast.error('Error', msg);
      },
    });
  }
  deleteParent(id: number) {
    const payload = {
      id: [id],
    };

    if (!confirm('Are you sure you want to delete this parent?')) return;

    this.parentService.deleteParent(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);

        // reload table
        this.loadParent(this.currentPage, this.rowsPerPage);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to delete parent.';
        this.toast.error('Error', msg);
      },
    });
  }
  private getParentById(id: number): void {
    this.parentService.getParentById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.parentConfig = createParentDetailConfig(data, this.parentService.fileAPIUrl);
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
        return 'Pending'; // or 'Inactive' depende sa backend mo
    }
  }
}
