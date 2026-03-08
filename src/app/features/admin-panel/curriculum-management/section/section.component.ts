import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { DataTableComponent, RowAction, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { SectionService } from '../../../../services/admin-panel/curriculum-management/section.service';
import { SectionModalComponent } from './section-modal/section-modal.component';
import { finalize } from 'rxjs';
import { SectionData } from '../../../../models/admin-panel/curriculum-management/section.model';

type UserRow = {
  id: number;
  section_name: string;
};

@Component({
  selector: 'sti-section',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css',
})
export class SectionComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
    { field: 'section_name', header: 'Section', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly sectionService = inject(SectionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  @ViewChild(SectionModalComponent) showCourseModalForm!: SectionModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;

  selectedRows: any[] = [];

  ngOnInit(): void {
    this.loadSection(1, this.rowsPerPage);
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
    this.loadSection(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadSection(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadSection(page: number, perPage: number) {
    this.loading = true;

    this.sectionService
      .getSection(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
         const mapped = res.data.map((a: SectionData) => ({
            id: a.id,
            section_name: a.section_name,
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
}
