import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
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

type UserRow = {
  id: number;
  course_name: string;
};

@Component({
  selector: 'sti-course',
  standalone: true,
  imports: [
    DataTableComponent, 
    CourseModalComponent, 
    ViewDetailsComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export class CourseComponent {
  cols: TableColumn<UserRow>[] = [
    // { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
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

  @ViewChild(CourseModalComponent) showCourseModalForm!: CourseModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: UserRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  openModal = false;
  showViewDetails = false;

  selectedRows: any[] = [];

  courseConfig: DetailModalConfig = {
    title: 'Course Details',
    showProfile: true,
    profileImage: '',
    fields: [],
  };

  ngOnInit(): void {
    this.loadCourse(1, this.rowsPerPage);
  }
  // MARK: - This part is for all button function
  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);

    if (e.actionKey === 'edit') {
      this.showCourseModalForm?.updateDialog(e.row.id);
    } else if (e.actionKey === 'view') {
      // optional view function
      this.getCoursenById(e.row.id);
    }
  }

  openImportCsv() {
    console.log('import csv clicked', this.selectedRows);
  }

  openAddModal() {
    this.showCourseModalForm?.showDialog();
  }

  openDeleteModal() {
    console.log('clicked!');
    // this.deleteSelectedAdmins();
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadCourse(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadCourse(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    // Handle cancel if needed
    console.log('Add form cancelled');
  }

  // MARK: - This part is for API call function
  loadCourse(page: number, perPage: number) {
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
          console.error('getAdmins failed', err);
          this.rows = [];
        },
      });
  }

  private getCoursenById(id: number): void {
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
