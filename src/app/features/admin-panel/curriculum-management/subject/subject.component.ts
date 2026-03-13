import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
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

type UserRow = {
  id: number;
  subject_code: string;
  subject_name: string;
};
@Component({
  selector: 'sti-subject',
  standalone: true,
  imports: [DataTableComponent, SubjectModalComponent ],
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

  @ViewChild(SubjectModalComponent) showSubjectModalForm!: SubjectModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;

  selectedRows: any[] = [];

  ngOnInit(): void {
    this.loadSubject(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);
    if (e.actionKey === 'edit') {
      this.showSubjectModalForm?.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
    }
  }

  openImportCsv() {
    console.log('import csv clicked', this.selectedRows);
  }

  openAddModal() {
    this.showSubjectModalForm?.showDialog();
  }

  openDeleteModal() {
    console.log('clicked!');
    // this.deleteSelectedAdmins();
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

  deleteSelectedSubject(): void {
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
}
