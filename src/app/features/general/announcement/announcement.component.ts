import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service'; // ✅ ADD

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  audience: string[];
  author: string;
  date: string;
  status: 'active' | 'inactive' | 'scheduled';
  pinned: boolean;
  views: number;
  attachments: Attachment[];
  schedule?: string;
  expiryDate?: string;
}

interface Attachment {
  name: string;
  type: string;
  url: string;
  file?: File;
}

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement.component.html',
})
export class AnnouncementComponent implements OnInit {
  constructor(private toast: ToastService) {} // ✅ ADD

  // Main data
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  selectedAnnouncement: Announcement | null = null;
  currentAnnouncement: Announcement = this.getEmptyAnnouncement();

  // Filter states
  searchTerm: string = '';
  filterPriority: string = 'all';
  filterAudience: string = 'all';
  filterStatus: string = 'all';
  filterCourse: string = 'all';

  // Modal states
  showModal: boolean = false;
  showViewModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  // Stats
  stats = {
    total: 0,
    active: 0,
    pinned: 0,
    totalViews: 0,
  };

  // Date for header
  todayDate: string = '';

  ngOnInit(): void {
    this.loadAnnouncements();
    this.updateStats();
    this.filterAnnouncements();
    this.setTodayDate();
  }

  setTodayDate(): void {
    const today = new Date();
    this.todayDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  loadAnnouncements(): void {
    this.announcements = [
      {
        id: 1,
        title: 'Enrollment for Second Semester Opens',
        content:
          "Enrollment for the Second Semester 2024-2025 will begin on October 15, 2024. Please prepare your documents and visit the Registrar's Office during office hours. Early enrollment is encouraged to secure your preferred schedule.",
        priority: 'urgent',
        audience: ['students'],
        author: 'Admin User',
        date: '2024-10-01',
        status: 'active',
        pinned: true,
        views: 1247,
        attachments: [
          {
            name: 'enrollment-schedule.jpg',
            type: 'image/jpeg',
            url: 'https://via.placeholder.com/400x300/1a4b8c/ffffff?text=Enrollment+Schedule',
          },
        ],
      },
      {
        id: 2,
        title: 'Faculty Meeting - October 10',
        content:
          'All faculty members are required to attend the monthly faculty meeting on October 10, 2024, at 2:00 PM in the Conference Room. Agenda includes curriculum updates and semester planning.',
        priority: 'high',
        audience: ['teachers'],
        author: 'Admin User',
        date: '2024-09-28',
        status: 'active',
        pinned: false,
        views: 89,
        attachments: [],
      },
      {
        id: 3,
        title: 'System Maintenance Notice',
        content:
          'The university portal will be undergoing scheduled maintenance on October 5, 2024 from 2:00 AM to 6:00 AM. During this time, access to the portal and online services will be unavailable.',
        priority: 'normal',
        audience: ['students', 'teachers', 'staff'],
        author: 'Admin User',
        date: '2024-09-30',
        status: 'scheduled',
        pinned: false,
        views: 234,
        attachments: [],
      },
      {
        id: 4,
        title: 'Library Extended Hours During Finals',
        content:
          'The library will extend its operating hours during the final examination period. Hours will be 7:00 AM to 10:00 PM from October 25 to November 5. Study rooms are available for reservation.',
        priority: 'normal',
        audience: ['students'],
        author: 'Admin User',
        date: '2024-09-22',
        status: 'active',
        pinned: false,
        views: 634,
        attachments: [
          {
            name: 'library-hours.jpg',
            type: 'image/jpeg',
            url: 'https://via.placeholder.com/400x300/2d68b8/ffffff?text=Library+Hours',
          },
        ],
      },
      {
        id: 5,
        title: 'Student Organization Fair - October 20',
        content:
          'Join us for the Student Organization Fair on October 20! All registered student organizations can set up booths to showcase activities and recruit new members. Registration deadline: October 15.',
        priority: 'normal',
        audience: ['students', 'organizations'],
        author: 'Admin User',
        date: '2024-09-25',
        status: 'active',
        pinned: true,
        views: 856,
        attachments: [
          {
            name: 'organization-fair-poster.jpg',
            type: 'image/jpeg',
            url: 'https://via.placeholder.com/400x600/2d68b8/ffffff?text=Organization+Fair',
          },
        ],
      },
      {
        id: 6,
        title: 'Staff Meeting: Year-End Planning',
        content:
          'All staff members are requested to attend the year-end planning meeting on October 8, 2024 at 10:00 AM in the Main Conference Room.',
        priority: 'low',
        audience: ['staff'],
        author: 'Admin User',
        date: '2024-09-27',
        status: 'active',
        pinned: false,
        views: 45,
        attachments: [],
      },
    ];
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        continue;
      }

      this.currentAnnouncement.attachments.push({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        file: file,
      });
    }

    event.target.value = '';
  }

  removeAttachment(index: number): void {
    this.currentAnnouncement.attachments.splice(index, 1);
  }

  updateStats(): void {
    this.stats.total = this.announcements.length;
    this.stats.active = this.announcements.filter((a) => a.status === 'active').length;
    this.stats.pinned = this.announcements.filter((a) => a.pinned).length;
    this.stats.totalViews = this.announcements.reduce((sum, a) => sum + a.views, 0);
  }

  filterAnnouncements(): void {
    let filtered = [...this.announcements];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.author.toLowerCase().includes(term)
      );
    }

    if (this.filterPriority !== 'all') {
      filtered = filtered.filter((a) => a.priority === this.filterPriority);
    }

    if (this.filterAudience !== 'all') {
      filtered = filtered.filter((a) => a.audience.includes(this.filterAudience));
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === this.filterStatus);
    }

    this.filteredAnnouncements = filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterPriority = 'all';
    this.filterAudience = 'all';
    this.filterStatus = 'all';
    this.filterCourse = 'all';
    this.filterAnnouncements();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.currentAnnouncement = this.getEmptyAnnouncement();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentAnnouncement = this.getEmptyAnnouncement();
  }

  submitAnnouncement(): void {
    if (!this.currentAnnouncement.title?.trim() || !this.currentAnnouncement.content?.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.currentAnnouncement.audience || this.currentAnnouncement.audience.length === 0) {
      alert('Please select at least one target audience');
      return;
    }

    if (this.modalMode === 'create') {
      const newId =
        this.announcements.length > 0 ? Math.max(...this.announcements.map((a) => a.id)) + 1 : 1;

      const newAnnouncement: Announcement = {
        ...this.currentAnnouncement,
        id: newId,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        author: 'Admin User',
      };

      this.announcements.unshift(newAnnouncement);
    }

    this.updateStats();
    this.filterAnnouncements();
    this.closeModal();
  }

  viewAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;

    const index = this.announcements.findIndex((a) => a.id === announcement.id);
    if (index !== -1) {
      this.announcements[index].views++;
      this.selectedAnnouncement.views++;
    }

    this.updateStats();
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedAnnouncement = null;
  }

  togglePin(id: number): void {
    const announcement = this.announcements.find((a) => a.id === id);
    if (announcement) {
      announcement.pinned = !announcement.pinned;

      // ✅ TOAST INFO PAG PIN/UNPIN
      this.toast.info(announcement.pinned ? 'Pinned' : 'Unpinned', announcement.title);

      this.filterAnnouncements();
      this.updateStats();
    }
  }

  toggleStatus(id: number): void {
    const announcement = this.announcements.find((a) => a.id === id);
    if (announcement) {
      announcement.status = announcement.status === 'active' ? 'inactive' : 'active';
      this.filterAnnouncements();
      this.updateStats();
    }
  }

  updateAudience(event: any, audience: string): void {
    if (!this.currentAnnouncement.audience) {
      this.currentAnnouncement.audience = [];
    }

    if (event.target.checked) {
      if (!this.currentAnnouncement.audience.includes(audience)) {
        this.currentAnnouncement.audience.push(audience);
      }
    } else {
      this.currentAnnouncement.audience = this.currentAnnouncement.audience.filter((a) => a !== audience);
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getPriorityClass(priority: string): string {
    const classes = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return classes[priority as keyof typeof classes] || classes.normal;
  }

  getAudienceClass(audience: string): string {
    const classes = {
      students: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      teachers: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      organizations: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      parents: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return classes[audience as keyof typeof classes] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }

  private getEmptyAnnouncement(): Announcement {
    return {
      id: 0,
      title: '',
      content: '',
      priority: 'normal',
      audience: [],
      author: 'Admin User',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      pinned: false,
      views: 0,
      attachments: [],
      schedule: '',
      expiryDate: '',
    };
  }
}