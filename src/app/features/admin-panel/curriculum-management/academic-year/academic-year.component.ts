import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';

import { AcademicYearService } from '../../../../services/admin-panel/curriculum-management/academic-year.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AcademicYearModalComponent } from './academic-year-modal/academic-year-modal.component';
import { finalize } from 'rxjs';

import { AcademicYearData } from '../../../../models/admin-panel/curriculum-management/academic-year.model';
import { DetailModalConfig } from '../../../../shared/components/view-details/view-details.component';
import { ViewDetailsComponent } from '../../../../shared/components/view-details/view-details.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type AcademicYearRow = {
  id: number;
  academic_year: string;
  semester: string;
};

@Component({
  selector: 'sti-academic-year',
  standalone: true,
  imports: [
    DataTableComponent,
    AcademicYearModalComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './academic-year.component.html',

})
export class AcademicYearComponent {

  cols: TableColumn<AcademicYearRow>[] = [
    { field: 'academic_year', header: 'Academic Year', sortable: true, filter: true },
    { field: 'semester', header: 'Semester', sortable: true, filter: true },
  ];

  actions: RowAction<AcademicYearRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(AcademicYearModalComponent) academicYearModal!: AcademicYearModalComponent;

  private readonly academicYearService = inject(AcademicYearService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  loading = false;
  rowsPerPage = 12;
  rows: AcademicYearRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  showViewDetails = false;

  selectedDeleteId: number | null = null;
  selectedRows: AcademicYearRow[] = [];

  academicYearConfig: DetailModalConfig = {
    title: 'Academic Year Details',
    showProfile: false,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadAcademicYear(1, this.rowsPerPage);
  }

  // MARK: - UI Actions
  onRow(row: AcademicYearRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: AcademicYearRow }) {
    if (e.actionKey === 'edit') {
      this.academicYearModal.updateDialog(e.row.id);

    } else if (e.actionKey === 'view') {
      this.getAcademicYearById(e.row.id);

    } else if (e.actionKey === 'delete') {
      this.deleteAcademicYear(e.row.id);
    }
  }

  openAddModal() {
    this.academicYearModal.showDialog();
  }

  openDeleteModal() {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select an academic year to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected academic years?'
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadAcademicYear(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadAcademicYear(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Modal cancelled');
  }

  // MARK: - API Calls
  loadAcademicYear(page: number, perPage: number) {
    this.loading = true;

    this.academicYearService
      .getAcademicYear(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: AcademicYearData) => ({
            id: a.id,
            academic_year: a.academic_year,
            semester: a.semester,
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
          console.error('getAcademicYear failed', err);
          this.rows = [];
        },
      });
  }

  deleteAcademicYear(id: number) {
    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this academic year?'
    });
  }

  confirmDelete() {

    // MULTIPLE DELETE
    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row) => row.id)
      };

      this.academicYearService.deleteAcademicYear(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadAcademicYear(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete academic years');
        }
      });

      return;
    }

    // SINGLE DELETE
    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId]
    };

    this.academicYearService.deleteAcademicYear(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadAcademicYear(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete academic year');
      }
    });
  }

  handleCancelDelete() {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }

  private getAcademicYearById(id: number): void {
    this.academicYearService.getAcademicYearById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.academicYearConfig = {
            title: 'Academic Year Details',
            showProfile: false,
            profileImage: '',
            fields: [
              { label: 'Academic Year', value: data.academic_year },
              { label: 'Semester', value: data.semester },
            ],
          };

          this.showViewDetails = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load academic year.';
        this.toast.error('Error', msg);
      },
    });
  }
}