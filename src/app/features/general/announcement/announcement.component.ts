import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import { AnnouncementService } from '../../../services/general/announcement.service';
import { AnnouncementData } from '../../../models/admin-panel/announcement/announcement.model';

import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface AnnouncementApiItem extends AnnouncementData {
  created_at?: string | null;
  updated_at?: string | null;
  author?: string | null;
  creator_name?: string | null;
  created_by_name?: string | null;
  created_by?: {
    name?: string | null;
    full_name?: string | null;
  } | null;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  author: string | null;
  date: string;
  status: 'active' | 'inactive';
  attachments: Attachment[];
}

interface Attachment {
  name: string;
  type: string;
  url: string;
  file?: File;
}

interface SelectOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './announcement.component.html',
})
export class AnnouncementComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private announcementService: AnnouncementService,
    private cdr: ChangeDetectorRef
  ) {}

  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];

  searchTerm = '';
  filterPriority: string | null = null;

  isLoading = false;

  priorityOptions: SelectOption[] = [
    { label: 'All Priorities', value: null },
    { label: 'High', value: 'high' },
    { label: 'Normal', value: 'normal' },
    { label: 'Low', value: 'low' },
  ];

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.announcementService.getAnnouncement(1, 10).subscribe({
      next: (response) => {
        this.announcements = (response.data ?? []).map((item: AnnouncementApiItem) =>
          this.mapApiAnnouncement(item)
        );

        this.filterAnnouncements();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load announcements:', error);

        this.announcements = [];
        this.filteredAnnouncements = [];
        this.isLoading = false;

        this.cdr.detectChanges();
        this.toast.error('Failed to load announcements', 'Error');
      },
    });
  }

  private mapApiAnnouncement(item: AnnouncementApiItem): Announcement {
    return {
      id: item.id,
      title: item.title,
      content: item.description,
      priority: this.mapPriority(item.priority),
      author: this.resolveAuthor(item),
      date: item.created_at ?? item.updated_at ?? new Date().toISOString(),
      status: this.mapStatus(item.status),
      attachments: item.attachment
        ? [
            {
              name: this.getFileName(item.attachment),
              type: this.getMimeTypeFromPath(item.attachment),
              url: this.buildAttachmentUrl(item.attachment),
            },
          ]
        : [],
    };
  }

  private resolveAuthor(item: AnnouncementApiItem): string | null {
    if (item.author) return item.author;
    if (item.creator_name) return item.creator_name;
    if (item.created_by_name) return item.created_by_name;
    if (item.created_by?.full_name) return item.created_by.full_name;
    if (item.created_by?.name) return item.created_by.name;
    return null;
  }

  private mapPriority(priority: string): 'high' | 'normal' | 'low' {
    const value = (priority || '').toLowerCase();

    if (value === 'high') return 'high';
    if (value === 'normal') return 'normal';
    return 'low';
  }

  private mapStatus(status: string): 'active' | 'inactive' {
    const value = (status || '').toLowerCase();
    return value === 'active' ? 'active' : 'inactive';
  }

  private buildAttachmentUrl(path: string): string {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const base = this.announcementService.fileAPIUrl.endsWith('/')
      ? this.announcementService.fileAPIUrl
      : `${this.announcementService.fileAPIUrl}/`;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${base}${cleanPath}`;
  }

  private getFileName(path: string): string {
    return path.split('/').pop() || 'attachment';
  }

  private getMimeTypeFromPath(path: string): string {
    const lower = path.toLowerCase();

    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.mp4')) return 'video/mp4';
    if (lower.endsWith('.mov')) return 'video/quicktime';
    if (lower.endsWith('.avi')) return 'video/x-msvideo';

    return 'application/octet-stream';
  }

  filterAnnouncements(): void {
    let filtered = [...this.announcements];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();

      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          (a.author ?? '').toLowerCase().includes(term)
      );
    }

    if (this.filterPriority) {
      filtered = filtered.filter((a) => a.priority === this.filterPriority);
    }

    this.filteredAnnouncements = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterPriority = null;
    this.filterAnnouncements();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';

    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPriorityClass(priority: string): string {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'normal':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  }
}