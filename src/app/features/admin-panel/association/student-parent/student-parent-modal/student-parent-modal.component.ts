import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { ModalMode } from '../../../../../enums/modal.mode';
import { StudentParentService } from '../../../../../services/admin-panel/association/student-parent.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { AssignStudentParentPayload } from '../../../../../payloads/admin-panel/association/student-parent/student-parent.payload';
import { ParentService } from '../../../../../services/admin-panel/user-management/parent/parent.service';
import { StudentService } from '../../../../../services/admin-panel/user-management/student/student.service';

type SelectOption = {
  label: string;
  value: number;
};

@Component({
  selector: 'sti-student-parent-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './student-parent-modal.component.html',
})
export class StudentParentModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('studentParentForm') studentParentFormRef?: NgForm;

  private readonly studentParentService = inject(StudentParentService);
  private readonly studentService = inject(StudentService);
  private readonly parentService = inject(ParentService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  loadingOptions = false;
  mode: ModalMode = ModalMode.ADD;

  student_id: number | null = null;
  parent_id: number | null = null;

  student_name = '';
  parent_name = '';

  currentID = 0;
  pendingEditId: number | null = null;

  studentOptions: SelectOption[] = [];
  parentOptions: SelectOption[] = [];

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Student to Parent';
    if (this.mode === ModalMode.UPDATE) return 'Update Student to Parent';
    return 'Student to Parent Details';
  }

  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
    this.loadDropdownOptions();
  }

  viewDialog(id: number): void {
    this.mode = ModalMode.VIEW;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);

    setTimeout(() => {
      this.getStudentParentById(id);
    });
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);
    this.loadDropdownOptions();

    setTimeout(() => {
      this.getStudentParentById(id);
    });
  }

  onDialogShown(): void {
    if ((this.mode === ModalMode.UPDATE || this.mode === ModalMode.VIEW) && this.pendingEditId) {
      this.getStudentParentById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.student_id = null;
    this.parent_id = null;
    this.student_name = '';
    this.parent_name = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  private loadDropdownOptions(): void {
    this.loadingOptions = true;

    forkJoin({
      students: this.studentService.listAllStudents(),
      parents: this.parentService.listAllParents(),
    }).subscribe({
      next: ({ students, parents }) => {
        this.studentOptions = (students.data ?? []).map((student: any) => ({
          value: student.id,
          label: `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim(),
        }));

        this.parentOptions = (parents.data ?? []).map((parent: any) => ({
          value: parent.id,
          label: `${parent.first_name ?? ''} ${parent.last_name ?? ''}`.trim(),
        }));

        this.loadingOptions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingOptions = false;
        this.studentOptions = [];
        this.parentOptions = [];
        this.toast.error('Error', 'Failed to load student/parent list');
      },
    });
  }

  close() {
    this.submitted = false;
    this.visible = false;
    this.student_id = null;
    this.parent_id = null;
    this.student_name = '';
    this.parent_name = '';
    this.onCancel.emit();
  }

  onSave(form: NgForm) {
    if (this.mode === ModalMode.VIEW) return;

    if (form.invalid) {
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

  private submitAction(): void {
    const payload: AssignStudentParentPayload = {
      student_id: this.student_id!,
      parent_id: this.parent_id!,
    };

    this.studentParentService.createStudentParent(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private submitUpdateAction(): void {
    const payload: AssignStudentParentPayload = {
      student_id: this.student_id!,
      parent_id: this.parent_id!,
    };

    this.studentParentService.updateStudentParent(this.currentID, payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private getStudentParentById(id: number): void {
    this.studentParentService.getStudentParentById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.student_id = data.student?.id ?? null;
        this.parent_id = data.parent?.id ?? null;

        this.student_name = `${data.student?.first_name ?? ''} ${data.student?.last_name ?? ''}`.trim();
        this.parent_name = `${data.parent?.first_name ?? ''} ${data.parent?.last_name ?? ''}`.trim();

        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load student-parent details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }
}