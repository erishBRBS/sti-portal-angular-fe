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
import { SectionService } from '../../../../services/admin-panel/curriculum-management/section.service';
import { SectionModalComponent } from './section-modal/section-modal.component';
import { finalize } from 'rxjs';
import { SectionData } from '../../../../models/admin-panel/curriculum-management/section.model';
import { createASectionDetailConfig } from '../../../../helper/section-helper';
import { DetailModalConfig } from '../../../../shared/components/view-details/view-details.component';
import { ViewDetailsComponent } from '../../../../shared/components/view-details/view-details.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type UserRow = {
  id: number;
  section_name: string;
};

@Component({
  selector: 'sti-section',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SectionModalComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css',
})
export class SectionComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'section_name', header: 'Section', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(SectionModalComponent) sectionModal!: SectionModalComponent;

  private readonly sectionService = inject(SectionService);
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

  sectionConfig: DetailModalConfig = {
    title: 'Section Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadSection(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.sectionModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getSectionById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteSection(e.row.id);
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

      this.sectionService.bulkUploadSection(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadSection(this.currentPage, this.rowsPerPage);
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
    this.sectionModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.isBrowser) return;

    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a section to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected sections?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadSection(e.page, e.perPage);
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadSection(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadSection(page: number, perPage: number) {
    if (!this.isBrowser) return;

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
          console.error('getSection failed', err);
          this.rows = [];
        },
      });
  }

  deleteSection(id: number) {
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

      this.sectionService.deleteSection(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadSection(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete sections');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.sectionService.deleteSection(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadSection(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete section');
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

  private getSectionById(id: number): void {
    if (!this.isBrowser) return;

    this.sectionService.getSectionById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.sectionConfig = createASectionDetailConfig(data, this.sectionService.fileAPIUrl);
          this.showViewDetails = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load section details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  deleteSelectedSection(): void {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: UserRow) => row.id),
    };

    this.sectionService.deleteSection(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadSection(this.currentPage, this.rowsPerPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to delete sections');
      },
    });
  }
}