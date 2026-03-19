import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ModalMode } from '../../../../../enums/modal.mode';
import { CourseService } from '../../../../../services/admin-panel/curriculum-management/course.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateCoursePayload } from '../../../../../payloads/admin-panel/curriculum/course/create-course.payload';

@Component({
  selector: 'sti-course-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './course-modal.component.html',
  styleUrl: './course-modal.component.css',
})
export class CourseModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('courseForm') courseFormRef?: NgForm;

  private readonly courseService = inject(CourseService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // template-driven fields
  course_name = '';
  currentID = 0;
  pendingEditId: number | null = null;

get dialogTitle(): string {

  if (this.mode === ModalMode.ADD) return 'Add Course';

  if (this.mode === ModalMode.UPDATE) return 'Update Course';

  return 'View Course';

}

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }
  viewDialog(id: number): void {

  this.mode = ModalMode.VIEW;
  this.currentID = id;
  this.visible = true;

  this.resetForm(true);

  setTimeout(() => {
    this.getCourseById(id);
  });

}
  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);
    setTimeout(() => {
      this.getCourseById(id);
    });
  }

  onDialogShown(): void {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getCourseById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.course_name = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  // MARK: - Button Function
  close() {
    this.submitted = false;
    this.course_name = '';
    this.visible = false;
  }

  onSave(form: NgForm) {
    if (form.invalid) {
      console.log('form invalid');
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }
    
    if (this.mode === ModalMode.ADD) {
      this.submitAction();
    } else {
      this.submitUpdateAction();
    }
  }

  // MARK: - API Function
  private submitAction(): void {
    const payload: CreateCoursePayload = {
      course_name: this.course_name,
    };

    this.courseService.createCourse(payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(msg);
      },
    });
  }

  private submitUpdateAction(): void {
    const payload: CreateCoursePayload = {
      course_name: this.course_name,
    };

    this.courseService.updateCourse(this.currentID, payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(msg);
      },
    });
  }

  private getCourseById(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (response) => {
        const data = response.data;
        this.course_name = data.course_name;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load course details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }
}