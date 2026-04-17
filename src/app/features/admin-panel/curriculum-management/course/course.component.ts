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
import { CourseService } from '../../../../services/admin-panel/curriculum-management/course.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CourseModalComponent } from './course-modal/course-modal.component';
import { finalize } from 'rxjs';
import { CourseData } from '../../../../models/admin-panel/curriculum-management/course.model';
import {
  DetailModalConfig,
  ViewDetailsComponent,
} from '../../../../shared/components/view-details/view-details.component';
import { createACourseDetailConfig } from '../../../../helper/course.helper';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type UserRow = {
  id: number;
  course_name: string;
};

@Component({
  selector: 'sti-course',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    CourseModalComponent,
    ViewDetailsComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export class CourseComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  cols: TableColumn<UserRow>[] = [
    { field: 'course_name', header: 'Course', sortable: true, filter: true },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly courseService = inject(CourseService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(CourseModalComponent) courseModal!: CourseModalComponent;

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

  courseConfig: DetailModalConfig = {
    title: 'Course Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadCourse(1, this.rowsPerPage);
  }

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    if (e.actionKey === 'edit') {
      this.courseModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      this.getCoursenById(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteCourse(e.row.id);
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

      this.courseService.bulkUploadCourse(file).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.loadCourse(this.currentPage, this.rowsPerPage);
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
    this.courseModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.isBrowser) return;

    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a subject to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected courses?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    if (!this.isBrowser) return;

    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadCourse(e.page, e.perPage);
  }

  onModalSuccess(): void {
    if (!this.isBrowser) return;
    this.loadCourse(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Add form cancelled');
  }

  loadCourse(page: number, perPage: number) {
    if (!this.isBrowser) return;

    this.loading = true;

    this.courseService
      .getCourse(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map((a: CourseData) => ({
            id: a.id,
            course_name: a.course_name,
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
          console.error('getCourse failed', err);
          this.rows = [];
        },
      });
  }

  deleteCourse(id: number) {
    if (!this.isBrowser) return;

    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this course?',
    });
  }

  confirmDelete() {
    if (!this.isBrowser) return;

    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row: UserRow) => row.id),
      };

      this.courseService.deleteCourse(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadCourse(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete courses');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.courseService.deleteCourse(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadCourse(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete course');
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

  private getCoursenById(id: number): void {
    if (!this.isBrowser) return;

    this.courseService.getCourseById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.ngZone.run(() => {
          this.courseConfig = createACourseDetailConfig(data, this.courseService.fileAPIUrl);
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

  deleteSelectedCourse(): void {
    if (!this.isBrowser) return;

    const payload = {
      id: this.selectedRows.map((row: UserRow) => row.id),
    };

    this.courseService.deleteCourse(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadCourse(this.currentPage, this.rowsPerPage);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to delete sections');
      },
    });
  }
}