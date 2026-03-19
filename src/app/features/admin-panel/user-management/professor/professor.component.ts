import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
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
import { DetailModalConfig, ViewDetailsComponent } from '../../../../shared/components/view-details/view-details.component';
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
  imports: [
    DataTableComponent, 
    ProfessorModalComponent,
    ViewDetailsComponent
  ],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css',
})
export class ProfessorManagementComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
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
        r.status === 'Active' ? 'success' : r.status === 'Pending' ? 'warn' : 'danger',
    },
    { field: 'createdAt', header: 'Created', sortable: true, filter: true, type: 'datetime' },
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

  selectedRows: any[] = [];

  professorConfig: DetailModalConfig = {
    title: 'Professor Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadProfessor(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

onAction(e: { actionKey: string; row: UserRow }) {

  if (e.actionKey === 'edit') {
    this.professorModal.updateDialog(e.row.id);
  }

  else if (e.actionKey === 'view') {
    this.professorModal.viewDialog(e.row.id);
  }

  else if (e.actionKey === 'delete') {
    this.deleteProfessor(e.row.id);
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

    this.professorService.importProfessor(file).subscribe({

      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadProfessor(this.currentPage, this.rowsPerPage);
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
    this.professorModal?.showDialog();
  }

openDeleteModal() {

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
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadProfessor(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadProfessor(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadProfessor(page: number, perPage: number) {
    this.loading = true;

    this.professorService
      .getProfessor(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: ProfessorData) => ({
            id: a.id,
            professor_name: a.professor_name,
            email_address: a.email_address,
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

  const payload = {
    id: this.selectedRows.map((row: any) => row.id)
  };

  this.professorService.deleteProfessor(payload).subscribe({
    next: (res: any) => {
      this.toast.success('Success', res.message);

      // clear selection
      this.selectedRows = [];

      // reload table
      this.loadProfessor(this.currentPage, this.rowsPerPage);
    },
    error: (err: any) => {
      const msg = err?.error?.message ?? 'Failed to delete parents.';
      this.toast.error('Error', msg);
    }
  });
  }

  deleteProfessor(id: number) {

  const payload = {
    id: [id]
  };

  if (!confirm('Are you sure you want to delete this parent?')) return;

  this.professorService.deleteProfessor(payload).subscribe({
    next: (res: any) => {
      this.toast.success('Success', res.message);

      // reload table
      this.loadProfessor(this.currentPage, this.rowsPerPage);
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
