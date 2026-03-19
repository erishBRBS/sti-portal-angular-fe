import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { DataTableComponent, RowAction, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { ScheduleService } from '../../../../services/admin-panel/curriculum-management/schedule.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScheduleModalComponent } from './schedule-modal/schedule-modal.component';
import { finalize } from 'rxjs';
import { ScheduleData } from '../../../../models/admin-panel/curriculum-management/schedule.model';
import {DetailModalConfig, ViewDetailsComponent,} from '../../../../shared/components/view-details/view-details.component';
import { createACourseDetailConfig } from '../../../../helper/course.helper';
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
    DataTableComponent, ScheduleModalComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})

export class ScheduleComponent {
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

@ViewChild(ScheduleModalComponent)scheduleModal!: ScheduleModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: any[] = [];

    scheduleConfig: DetailModalConfig = {
    title: 'Course Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadSchedule(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

onAction(e: { actionKey: string; row: UserRow }) {

  if (e.actionKey === 'edit') {
    this.scheduleModal.updateDialog(e.row.id);
  }

  else if (e.actionKey === 'view') {
    this.scheduleModal.viewDialog(e.row.id);
  }

  else if (e.actionKey === 'delete') {
    this.deleteSchedule(e.row.id);
  }

}

openImportCsv() {

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';

  input.onchange = (event: any) => {
    const file: File = event.target.files[0];

    if (!file) return;

    this.scheduleService.importSchedule(file).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadSchedule(this.currentPage, this.rowsPerPage);
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
    this.scheduleModal?.showDialog();
  }

openDeleteModal() {
  if (!this.selectedRows.length) {
    this.toast.error('Error', 'Please select a section to delete.');
    return;
  }

  if (!confirm('Are you sure you want to delete selected section(s)?')) {
    return;
  }

  this.deleteSelectedSchedule();
}

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadSchedule(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadSchedule(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadSchedule(page: number, perPage: number) {
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
            start_time: a.start_time,
            end_time: a.end_time,
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
          console.error('getAdmins failed', err);
          this.rows = [];
        },
      });
  }

deleteSchedule(id: number) {
  const payload = {
    id: [id]
  };

  if (!confirm('Are you sure you want to delete this section?')) return;

  this.scheduleService.deleteSchedule(payload).subscribe({
    next: (res) => {
      this.toast.success('Success', res.message);
      this.loadSchedule(this.currentPage, this.rowsPerPage);
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Error', 'Failed to delete section');
    }
  });
}
deleteSelectedSchedule(): void {

  const payload = {
    id: this.selectedRows.map((row: UserRow) => row.id)
  };

  this.scheduleService.deleteSchedule(payload).subscribe({
    next: (res) => {
      this.toast.success('Success', res.message);

      // clear selection
      this.selectedRows = [];

      // reload table
      this.loadSchedule(this.currentPage, this.rowsPerPage);
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Error', 'Failed to delete sections');
    }
  });

}
}
