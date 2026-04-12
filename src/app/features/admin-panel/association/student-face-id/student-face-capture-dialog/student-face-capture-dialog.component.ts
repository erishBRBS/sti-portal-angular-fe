import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { StudentFaceIDService } from '../../../../../services/admin-panel/association/student-face-id.service';
import { EnrollFaceIDPayload } from '../../../../../payloads/admin-panel/association/student-face-id/student-face-id.payload';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../../shared/services/toast.service';

type CapturedPhoto = {
  file: File;
  preview: string;
};

@Component({
  selector: 'sti-student-face-capture-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './student-face-capture-dialog.component.html',
  styleUrl: './student-face-capture-dialog.component.css',
})
export class StudentFaceCaptureDialogComponent implements OnDestroy {
  private studentFaceIDService = inject(StudentFaceIDService);

  visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() uploaded = new EventEmitter<void>();

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  readonly requiredPhotoCount = 5;

  studentNo = '';
  studentName = '';
  capturedPhotos: CapturedPhoto[] = [];

  stream: MediaStream | null = null;
  cameraError = '';
  startingCamera = false;
  uploading = false;

  private readonly toast = inject(ToastService);

  get canCapture(): boolean {
    return !!this.stream && this.capturedPhotos.length < this.requiredPhotoCount;
  }

  get canUpload(): boolean {
    return (
      !!this.studentNo.trim() &&
      !!this.studentName.trim() &&
      this.capturedPhotos.length === this.requiredPhotoCount &&
      !this.uploading
    );
  }

  get remainingShots(): number {
    return this.requiredPhotoCount - this.capturedPhotos.length;
  }

  get emptySlots(): number[] {
    return Array.from(
      { length: Math.max(this.requiredPhotoCount - this.capturedPhotos.length, 0) },
      (_, i) => i,
    );
  }

  showDialog(): void {
    this.visible = true;
    // this.resetForm();
    // this.loadDropdownOptions();
  }

  async onDialogShow(): Promise<void> {
    await this.startCamera();
  }

  onDialogHide(): void {
    this.stopCamera();
    this.resetCapturedPhotos();
    this.studentNo = '';
    this.cameraError = '';
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  async startCamera(): Promise<void> {
    this.cameraError = '';
    this.startingCamera = true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported in this browser.');
      }

      this.stopCamera();

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      const video = this.videoEl?.nativeElement;
      if (!video) return;

      video.srcObject = this.stream;
      await video.play();
    } catch (error: any) {
      this.cameraError =
        error?.message || 'Unable to access camera. Please allow permission and try again.';
    } finally {
      this.startingCamera = false;
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoEl?.nativeElement) {
      this.videoEl.nativeElement.srcObject = null;
    }
  }

  async capturePhoto(): Promise<void> {
    if (!this.canCapture) return;

    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;

    if (!video.videoWidth || !video.videoHeight) {
      this.cameraError = 'Camera is not ready yet. Please try again.';
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      this.cameraError = 'Unable to capture image.';
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await this.canvasToBlob(canvas);

      const file = new File(
        [blob],
        `student-face-${this.studentNo || 'unknown'}-${this.capturedPhotos.length + 1}.jpg`,
        { type: 'image/jpeg' },
      );

      const preview = URL.createObjectURL(file);

      this.capturedPhotos.push({ file, preview });
      this.cameraError = '';
    } catch {
      this.cameraError = 'Failed to capture image.';
    }
  }

  removePhoto(index: number): void {
    const target = this.capturedPhotos[index];
    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }

    this.capturedPhotos.splice(index, 1);
  }

  clearAllPhotos(): void {
    this.resetCapturedPhotos();
  }

  save(): void {
    if (!this.canUpload) return;

    this.uploading = true;

    const files = this.capturedPhotos.map((item) => item.file);

    const payload: EnrollFaceIDPayload = {
      student_no: this.studentNo,
      full_name: this.studentName ?? '',
      images: files,
    };

    console.log('test', payload);

    this.studentFaceIDService
      .enrollFaceID(payload)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: () => {
          this.enrollFaceIDLaravel(payload);
        },
        error: (error) => {
          console.error(error);
          this.cameraError = error?.error?.message || 'Failed to upload captured photos.';
        },
      });
  }

  private enrollFaceIDLaravel(payload: EnrollFaceIDPayload): void {
    this.studentFaceIDService
      .enrollFaceIDLaravel(payload)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: () => {
          this.uploaded.emit();
          this.closeDialog();
        },
        error: (error) => {
          console.error(error);
          this.toast.error('Error', error?.error?.message);
          this.cameraError = error?.error?.message || 'Failed to upload captured photos.';
        },
      });
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error('Blob generation failed.'));
        },
        'image/jpeg',
        0.92,
      );
    });
  }

  private resetCapturedPhotos(): void {
    this.capturedPhotos.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    this.capturedPhotos = [];
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.resetCapturedPhotos();
  }

  searchStudent() {
    console.log('Search student:', this.studentNo);

    const studentNo = this.studentNo?.trim();

    if (!studentNo) {
      this.studentName = '';
      this.toast.error('Error', 'Student no is required.');
      return;
    }

    this.studentFaceIDService.getStudentNo(studentNo).subscribe({
      next: (res) => {
        this.studentName =
          `${res.data?.first_name ?? ''} ${res.data?.middle_name ?? ''} ${res.data?.last_name ?? ''}`.trim();

        this.toast.success('Success', res.message);
      },
      error: (err) => {
        this.studentName = '';

        if (err?.status === 404) {
          this.toast.error('Not Found', err?.error?.message ?? 'No student no found.');
          return;
        }

        this.toast.error('Error', err?.error?.message ?? 'Failed to search student.');
      },
    });
  }
}
