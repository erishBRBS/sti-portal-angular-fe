import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

import { ModalMode } from '../../../../enums/modal.mode';
import { AnnouncementService } from '../../../../services/general/announcement.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  AnnouncementPriority,
  AnnouncementStatus,
} from '../../../../models/admin-panel/announcement/announcement.model';
import { CreateAnnouncementPayload } from '../../../../payloads/admin-panel/announcement/announcement.payload';

@Component({
  selector: 'sti-announcement-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
  ],
  templateUrl: './announcement-modal.component.html',
})
export class AnnouncementModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChild('announcementForm') announcementFormRef?: NgForm;
  @ViewChild('attachmentInput') attachmentInputRef!: ElementRef<HTMLInputElement>;

  private readonly announcementService = inject(AnnouncementService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  title = '';
  description = '';
  priority: AnnouncementPriority = 'Normal';
  status: AnnouncementStatus = 'Active';

  notificationHeadline = '';
  notificationDescription = '';

  attachment: File | null = null;
  previewUrl: string | null = null;
  fileName = '';

  currentID = 0;
  pendingEditId: number | null = null;

  priorityOptions = [
    { label: 'Urgent', value: 'Urgent' as AnnouncementPriority },
    { label: 'High', value: 'High' as AnnouncementPriority },
    { label: 'Normal', value: 'Normal' as AnnouncementPriority },
    { label: 'Low', value: 'Low' as AnnouncementPriority },
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' as AnnouncementStatus },
    { label: 'Inactive', value: 'Inactive' as AnnouncementStatus },
  ];

  get isViewMode(): boolean {
    return this.mode === ModalMode.VIEW;
  }

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Announcement';
    if (this.mode === ModalMode.UPDATE) return 'Update Announcement';
    return 'View Announcement';
  }

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }

  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
  }

  viewDialog(id: number): void {
    this.mode = ModalMode.VIEW;
    this.currentID = id;
    this.visible = true;

    this.resetForm(true);

    setTimeout(() => {
      this.getAnnouncementById(id);
    });
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);

    setTimeout(() => {
      this.getAnnouncementById(id);
    });
  }

  onDialogShown(): void {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getAnnouncementById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;

    this.title = '';
    this.description = '';
    this.priority = 'Normal';
    this.status = 'Active';
    this.notificationHeadline = '';
    this.notificationDescription = '';

    this.clearAttachmentControls();

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  private clearAttachmentControls(): void {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.fileName = '';
    this.attachment = null;
    this.previewUrl = null;

    setTimeout(() => {
      if (this.attachmentInputRef?.nativeElement) {
        this.attachmentInputRef.nativeElement.value = '';
      }
    });
  }

  close(): void {
    this.submitted = false;
    this.title = '';
    this.description = '';
    this.priority = 'Normal';
    this.status = 'Active';
    this.notificationHeadline = '';
    this.notificationDescription = '';
    this.clearAttachmentControls();
    this.visible = false;
  }

  onSave(form: NgForm): void {
    if (form.invalid) {
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }

    if (this.mode === ModalMode.ADD) {
      this.submitAction();
    } else if (this.mode === ModalMode.UPDATE) {
      this.submitUpdateAction();
    }
  }

  onAttachmentSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    const lowerName = file.name.toLowerCase();

    const isImage =
      lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png');

    const isPdf = lowerName.endsWith('.pdf');
    const isDoc = lowerName.endsWith('.doc');
    const isDocx = lowerName.endsWith('.docx');

    const isAllowed = isImage || isPdf || isDoc || isDocx;
    const isTooLarge = file.size > 2 * 1024 * 1024;

    if (!isAllowed || isTooLarge) {
      this.toast.error(
        'Invalid File',
        'Please select JPG, JPEG, PNG, PDF, DOC, or DOCX under 2MB.',
      );
      input.value = '';
      return;
    }

    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.attachment = file;
    this.fileName = file.name;

    if (isImage) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  removeAttachment(): void {
    this.clearAttachmentControls();
  }

  private submitAction(): void {
    const payload: CreateAnnouncementPayload = {
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      notification_headline: this.notificationHeadline,
      notification_description: this.notificationDescription || this.description,
    };

    this.announcementService.createAnnouncement(payload, this.attachment).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
  }

  private submitUpdateAction(): void {
    const payload: CreateAnnouncementPayload = {
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      notification_headline: this.notificationHeadline,
      notification_description: this.notificationDescription || this.description,
    };

    this.announcementService.updateAnnouncement(this.currentID, payload, this.attachment).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
  }

  private getAnnouncementById(id: number): void {
    this.announcementService.getAnnouncementById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.title = data.title;
        this.description = data.description;
        this.priority = data.priority;
        this.status = data.status;

        // kailangan ibalik ito ng backend sa getAnnouncementById
        this.notificationHeadline = data.notification_headline ?? '';
        this.notificationDescription = data.notification_description ?? '';

        this.fileName = data.attachment ? this.extractFileName(data.attachment) : '';
        this.attachment = null;

        const lowerPath = (data.attachment || '').toLowerCase();
        const isImage =
          lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.png');

        this.previewUrl =
          data.attachment && isImage
            ? `${this.announcementService.fileAPIUrl}${data.attachment}?t=${Date.now()}`
            : null;

        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load announcement details.';
        this.toast.error('Error', msg);
      },
    });
  }

  private extractFileName(path?: string | null): string {
    if (!path) return '';
    return path.split('/').pop() || path;
  }
}