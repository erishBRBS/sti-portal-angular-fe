import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { finalize } from 'rxjs';

import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../shared/components/data-table/data-table.component';
import { AnnouncementModalComponent } from './announcement-modal/announcement-modal.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { AnnouncementService } from '../../../services/general/announcement.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AnnouncementData } from '../../../models/admin-panel/announcement/announcement.model';

type AnnouncementRow = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;

  attachmentPath: string;
  attachmentUrl: string;
  attachmentName: string;
  attachmentType: 'image' | 'file' | 'none';
};

@Component({
  selector: 'sti-announcement',
  standalone: true,
  imports: [CommonModule, DataTableComponent, AnnouncementModalComponent, ConfirmDialogComponent],
  templateUrl: './announcement.component.html',
})
export class AnnouncementComponent implements OnInit {
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(AnnouncementModalComponent) announcementModal!: AnnouncementModalComponent;

  private readonly announcementService = inject(AnnouncementService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  cols: TableColumn<AnnouncementRow>[] = [
    { field: 'title', header: 'Title', sortable: true, filter: true },
    { field: 'priority', header: 'Priority', sortable: true, filter: true },
    { field: 'status', header: 'Status', sortable: true, filter: true },
    {
      field: 'attachmentName',
      header: 'Attachment',
      type: 'attachment',
      sortable: false,
      filter: true,
      attachmentUrlGetter: (row) => row.attachmentUrl,
      attachmentLabelGetter: (row) => row.attachmentName,
      attachmentTypeGetter: (row) => row.attachmentType,
    },
  ];

  actions: RowAction<AnnouncementRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  loading = false;
  rowsPerPage = 12;
  rows: AnnouncementRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  deletingId: number | null = null;

  selectedDeleteId: number | null = null;
  selectedRows: AnnouncementRow[] = [];

  ngOnInit(): void {
    // browser lang tatawag ng API para iwas SSR/refresh 401
    if (isPlatformBrowser(this.platformId)) {
      this.loadAnnouncements(1, this.rowsPerPage);
    }
  }

  onRow(row: AnnouncementRow): void {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: AnnouncementRow }): void {
    if (e.actionKey === 'edit') {
      this.announcementModal.updateDialog(e.row.id);
      return;
    }

    if (e.actionKey === 'view') {
      this.announcementModal.viewDialog(e.row.id);
      return;
    }

    console.log('onAction fired', e);
    if (e.actionKey === 'delete') {
      this.deleteAnnouncement(e.row.id);
    }
  }

  openAddModal(): void {
    this.announcementModal.showDialog();
  }

  openDeleteModal(): void {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select an announcement to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected announcements?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }): void {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadAnnouncements(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadAnnouncements(this.currentPage, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Modal cancelled');
  }

  loadAnnouncements(page: number, perPage: number): void {
    // dagdag safety check
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading = true;

    this.announcementService
      .getAnnouncement(page, perPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const mapped: AnnouncementRow[] = res.data.map((a: AnnouncementData) => {
            const attachmentPath = a.attachment || '';
            const attachmentUrl = attachmentPath
              ? `${this.announcementService.fileAPIUrl}${attachmentPath}?t=${Date.now()}`
              : '';

            return {
              id: a.id,
              title: a.title,
              description: a.description,
              priority: a.priority,
              status: a.status,
              attachmentPath,
              attachmentUrl,
              attachmentName: this.extractFileName(attachmentPath),
              attachmentType: this.getAttachmentType(attachmentPath),
            };
          });

          queueMicrotask(() => {
            this.currentPage = res.pagination.current_page;
            this.total = res.pagination.total;
            this.first = (res.pagination.current_page - 1) * perPage;
            this.rows = mapped;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.error('getAnnouncement failed', err);
          this.rows = [];

          // optional: huwag mag-toast sa 401 kung SSR/refresh auth timing issue
          if (err?.status !== 401) {
            this.toast.error('Error', 'Failed to load announcements.');
          }

          this.cdr.markForCheck();
        },
      });
  }

  deleteAnnouncement(id: number): void {
    console.log('deleteAnnouncement fired', id);

    this.selectedDeleteId = id;
    this.selectedRows = [];

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this announcement?',
    });
  }

  confirmDelete(): void {
    console.log('confirmDelete fired', this.selectedDeleteId, this.selectedRows);
    if (this.selectedDeleteId !== null) {
      const payload = {
        id: [this.selectedDeleteId],
      };

      this.announcementService.deleteAnnouncement(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedDeleteId = null;
          this.selectedRows = [];
          this.loadAnnouncements(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error('Single delete failed:', err);
          this.toast.error('Error', err?.error?.message ?? 'Failed to delete announcement');
        },
      });

      return;
    }

    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row) => row.id),
      };

      this.announcementService.deleteAnnouncement(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.selectedDeleteId = null;
          this.loadAnnouncements(this.currentPage, this.rowsPerPage);
        },
        error: (err) => {
          console.error('Bulk delete failed:', err);
          this.toast.error('Error', err?.error?.message ?? 'Failed to delete announcements');
        },
      });

      return;
    }
  }

  handleCancelDelete(): void {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }

  private extractFileName(path?: string | null): string {
    if (!path) return 'No attachment';
    return path.split('/').pop() || path;
  }

  private getAttachmentType(path?: string | null): 'image' | 'file' | 'none' {
    if (!path) return 'none';

    const lower = path.toLowerCase();

    if (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.bmp') ||
      lower.endsWith('.svg')
    ) {
      return 'image';
    }

    return 'file';
  }
}