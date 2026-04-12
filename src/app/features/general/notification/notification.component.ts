import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/general/notification.service';
import { NotificationData } from '../../../models/general/notification/notification.model';
import { ToastService } from '../../../shared/services/toast.service';

type AlertItem = {
  id: number;
  announcementId: number | null;
  title: string;
  desc: string;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  alerts: AlertItem[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(page = 1, perPage = 50): void {
    this.loading = true;

    this.notificationService.getNotifications(page, perPage).subscribe({
      next: (res) => {
        const mapped: AlertItem[] = res.data.map((n: NotificationData) => ({
          id: n.id,
          announcementId: n.announcement_id ?? null,
          title: n.headline,
          desc: n.description,
          icon: 'pi pi-bell',
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
        }));

        queueMicrotask(() => {
          this.alerts = mapped;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('getNotifications failed', err);

        queueMicrotask(() => {
          this.alerts = [];
          this.loading = false;
          this.cdr.detectChanges();
        });

        this.toast.error('Error', 'Failed to load notifications.');
      },
    });
  }

  openNotification(item: AlertItem): void {
    if (!item.announcementId) {
      this.toast.error('Error', 'No linked announcement found.');
      return;
    }

    this.router.navigate(['/general/announcements'], {
      queryParams: {
        announcementId: item.announcementId,
      },
    });
  }
}
