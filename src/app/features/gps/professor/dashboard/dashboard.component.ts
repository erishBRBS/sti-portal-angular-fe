import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProfessorService } from '../../../../services/ats/professor/professor.service';
import { AnnouncementService } from '../../../../services/general/announcement.service';

type StatCard = {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  darkBg: string;
  iconColor: string;
};

type AnnouncementItem = {
  title: string;
  content: string;
  time: string;
};

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class ProfessorDashboardComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  private professorService = inject(ProfessorService);
  private announcementService = inject(AnnouncementService);
  private cdr = inject(ChangeDetectorRef);

  todayDate = '';
  loadingStudents = false;
  loadingAnnouncements = false;

  private totalStudents = 0;
  private totalAnnouncements = 0;

  stats: StatCard[] = [
    {
      label: 'Total Students',
      value: '0',
      icon: 'pi pi-users',
      bgColor: 'bg-green-100',
      darkBg: 'dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Announcements',
      value: '0',
      icon: 'pi pi-megaphone',
      bgColor: 'bg-orange-100',
      darkBg: 'dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  announcements: AnnouncementItem[] = [];

  ngOnInit(): void {
    if (this.isBrowser) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      this.todayDate = new Date().toLocaleDateString('en-US', options);

      this.loadStudentCount();
      this.loadAnnouncements();
      return;
    }

    this.todayDate = '';
  }

  private loadStudentCount(): void {
    if (!this.isBrowser) return;

    this.loadingStudents = true;
    this.cdr.detectChanges();

    this.professorService.getMyStudents().subscribe({
      next: (response) => {
        const students = response.data ?? [];
        this.totalStudents = students.length;
        this.updateStats();

        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load professor student count:', error);

        this.totalStudents = 0;
        this.updateStats();

        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadAnnouncements(): void {
    if (!this.isBrowser) return;

    this.loadingAnnouncements = true;
    this.cdr.detectChanges();

    this.announcementService.getAnnouncement(1, 5).subscribe({
      next: (response) => {
        const rows = response.data ?? [];

        this.totalAnnouncements = rows.length;

        this.announcements = rows.map((item: any) => ({
          title: item.title ?? 'Untitled Announcement',
          content: item.description ?? '',
          time: this.formatAnnouncementDate(item.created_at ?? item.updated_at ?? null),
        }));

        this.updateStats();

        this.loadingAnnouncements = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load announcements:', error);

        this.totalAnnouncements = 0;
        this.announcements = [];
        this.updateStats();

        this.loadingAnnouncements = false;
        this.cdr.detectChanges();
      },
    });
  }

  private updateStats(): void {
    this.stats = [
      {
        label: 'Total Students',
        value: String(this.totalStudents),
        icon: 'pi pi-users',
        bgColor: 'bg-green-100',
        darkBg: 'dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
      },
      {
        label: 'Announcements',
        value: String(this.totalAnnouncements),
        icon: 'pi pi-megaphone',
        bgColor: 'bg-orange-100',
        darkBg: 'dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
      },
    ];
  }

  private formatAnnouncementDate(value?: string | null): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}