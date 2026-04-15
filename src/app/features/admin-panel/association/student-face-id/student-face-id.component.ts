import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone, ViewChild } from '@angular/core';
import { DataTableImagesComponent } from '../../../../shared/components/data-table-images/data-table-images.component';
import { SharedTableColumn } from '../../../../shared/components/data-table-images/data-table-images.types';
import { StudentFaceCaptureDialogComponent } from './student-face-capture-dialog/student-face-capture-dialog.component';
import { StudentFaceIDService } from '../../../../services/admin-panel/association/student-face-id.service';
import { FaceRecognitionData } from '../../../../models/admin-panel/association/student-face-id.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type StudentFaceIDRow = {
  id: number;
  student_no: string;
  full_name: string;
  image_paths: string[];
  create_at: string;
};

@Component({
  selector: 'sti-student-face-id',
  standalone: true,
  imports: [CommonModule, DataTableImagesComponent, StudentFaceCaptureDialogComponent, ConfirmDialogComponent],
  templateUrl: './student-face-id.component.html',
})
export class StudentFaceIdComponent {
  faceDialogVisible = false;

  cols: SharedTableColumn[] = [
    {
      field: 'student_no',
      header: 'Student No',
      sortable: true,
      width: '160px',
    },
    {
      field: 'full_name',
      header: 'Full Name',
      sortable: true,
      width: '220px',
    },
    {
      field: 'image_paths',
      header: 'Photos',
      type: 'images',
      width: '260px',
      imageMax: 5,
    },
    {
      field: 'create_at',
      header: 'Created At',
      type: 'date',
      sortable: true,
      width: '200px',
    },
    {
     field: 'actions',
     header: 'Actions',
     width: '120px',
   },
  ];

  private readonly studentFaceIDService = inject(StudentFaceIDService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  loading = false;
  rowsPerPage = 12;
  rows: StudentFaceIDRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

selectedRows: StudentFaceIDRow[] = [];
selectedDeleteId: number | null = null;

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(StudentFaceCaptureDialogComponent)
  studentFaceCaptureDialogComponent!: StudentFaceCaptureDialogComponent;

  ngOnInit(): void {
    this.loadStudenFaceID(1, this.rowsPerPage);
  }

  openAddModal(): void {
    this.studentFaceCaptureDialogComponent.showDialog();
  }

  openDeleteModal() {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a record to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected students face?',
    });
  }

  onAction(e: { actionKey: string; row: StudentFaceIDRow }) {
  if (e.actionKey === 'delete') {
    this.deleteStudentFaceID(e.row.id);
  }

  if (e.actionKey === 'edit') {
   this.studentFaceCaptureDialogComponent.openEdit(e.row);
  }
}

  onUploaded(): void {
    this.loadStudenFaceID(this.currentPage, this.rowsPerPage);
  }

  // MARK: - This part is for API call function
  loadStudenFaceID(page: number, perPage: number): void {
    this.loading = true;

    this.studentFaceIDService.getFaceRecognition(page, perPage).subscribe({
      next: (res) => {
        const mapped = res.data.map((a: FaceRecognitionData) => ({
          id: a.id,
          student_no: a.student_no,
          full_name: a.full_name,
          image_paths: a.image_paths.map((path) => this.studentFaceIDService.fileAPIUrl + path),
          create_at: a.created_at,
        }));

        queueMicrotask(() => {
          this.currentPage = res.pagination.current_page;
          this.total = res.pagination.total;
          this.first = (res.pagination.current_page - 1) * perPage;
          this.rows = mapped;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('getAdmins failed', err);

        queueMicrotask(() => {
          this.rows = [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  deleteStudentFaceID(id: number) {
  this.selectedDeleteId = id;

  this.confirmDialog.open({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this student face ID?',
  });
}

confirmDelete() {

  if (this.selectedRows.length) {
    const payload = {
      ids: this.selectedRows.map((row: StudentFaceIDRow) => row.id),
    };

    this.studentFaceIDService.deleteStudentFaceID(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.selectedRows = [];
        this.loadStudenFaceID(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete selected records');
      },
    });

    return;
  }


  if (!this.selectedDeleteId) return;

  const payload = {
    ids: [this.selectedDeleteId],
  };

  this.studentFaceIDService.deleteStudentFaceID(payload).subscribe({
    next: (res) => {
      this.toast.success('Success', res.message);
      this.loadStudenFaceID(this.currentPage, this.rowsPerPage);
    },
    error: () => {
      this.toast.error('Error', 'Failed to delete record');
    },
  });
}
  handleCancelDelete() {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }
}
