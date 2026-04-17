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
import { ScheduleService } from '../../../../services/admin-panel/curriculum-management/schedule.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScheduleModalComponent } from './schedule-modal/schedule-modal.component';
import { finalize } from 'rxjs';
import { ScheduleData } from '../../../../models/admin-panel/curriculum-management/schedule.model';
import { createAScheduleDetailConfig } from '../../../../helper/schedule-helper';
import {
  ViewDetailsComponent,
  DetailModalConfig,
} from '../../../../shared/components/view-details/view-details.component';
import { TimeHelper } from '../../../../helper/time-helper';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type UserRow = {
  id: number;
  course_code: string;
  section_name: string;
  professor_name: string;
  subject_code: string;
  subject_name: string;
  day: string;
  start_time: string;
  end_time: string;
  duration: string;
  room: string;
};

@Component({
  selector: 'sti-schedule',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ScheduleModalComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'course_code', header: 'Course Code', sortable: true, filter: true },
    { field: 'section_name', header: 'Section Name', sortable: true, filter: true },
    { field: 'professor_name', header: 'Professor Name', sortable: true, filter: true },
    { field: 'subject_code', header: 'Subject Code', sortable: true, filter: true },
    { field: 'subject_name', header: 'Subject Name', sortable: true, filter: true },
    { field: 'day', header: 'Day', sortable: true, filter: true },
    { field: 'start_time', header: 'Start Time', sortable: true, filter: true },
    { field: 'end_time', header: 'End Time', sortable: true, filter: true },
    { field: 'duration', header: 'Duration Time', sortable: true, filter: true },
    { field: 'room', header: 'Room', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly scheduleService = inject(ScheduleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(ScheduleModalComponent) scheduleModal!: ScheduleModalComponent;

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

  scheduleConfig: DetailModalConfig = {
    title: 'Schedule Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadSchedule(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.scheduleModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getScheduleById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteSchedule(e.row.id);
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

      this.scheduleService.bulkUploadSchedule(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadSchedule(this.currentPage, this.rowsPerPage);
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
    this.scheduleModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.isBrowser) return;

    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a subject to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected schedules?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadSchedule(e.page, e.perPage);
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadSchedule(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadSchedule(page: number, perPage: number) {
    if (!this.isBrowser) return;

    this.loading = true;

    this.scheduleService
      .getSchedule(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: ScheduleData) => ({
            id: a.id,
            course_code: a.course_code,
            section_name: a.section.section_name,
            professor_name: a.professor.professor_name,
            subject_code: a.subject.subject_code,
            subject_name: a.subject.subject_name,
            day: a.day,
            start_time: TimeHelper.formatTo12Hour(a.start_time),
            end_time: TimeHelper.formatTo12Hour(a.end_time),
            duration: a.duration,
            room: a.room,
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
          console.error('getSchedule failed', err);
          this.rows = [];
        },
      });
  }

  private getScheduleById(id: number): void {
    if (!this.isBrowser) return;

    this.scheduleService.getScheduleById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.scheduleConfig = createAScheduleDetailConfig(data, this.scheduleService.fileAPIUrl);
          this.showViewDetails = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load schedule details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  deleteSchedule(id: number) {
    if (!this.isBrowser) return;

    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this schedule?',
    });
  }

  confirmDelete() {
    if (!this.isBrowser) return;

    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row: UserRow) => row.id),
      };

      this.scheduleService.deleteSchedule(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadSchedule(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete subjects');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.scheduleService.deleteSchedule(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadSchedule(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete schedule');
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

  deleteSelectedSchedule(): void {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: UserRow) => row.id),
    };

    this.scheduleService.deleteSchedule(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadSchedule(this.currentPage, this.rowsPerPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to delete sections');
      },
    });
  }
}