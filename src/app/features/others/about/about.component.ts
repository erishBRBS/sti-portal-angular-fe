import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

type Feature = {
  title: string;
  icon: string;
  colorClass: string;
  desc: string;
};

type Contact = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  features: Feature[] = [
    {
      title: 'Grade Tracking',
      icon: 'pi pi-star-fill',
      colorClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20',
      desc: 'Detailed grade breakdowns and progress tracking.',
    },
    {
      title: 'Class Schedule',
      icon: 'pi pi-calendar',
      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
      desc: 'Daily room assignments and professor info.',
    },
    {
      title: 'Announcements',
      icon: 'pi pi-megaphone',
      colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
      desc: 'Campus news and important notices in real-time.',
    },
  ];

  portalPoints: string[] = [
    'View your grades with just a quick tap of a button',
    'Know your day-to-day class schedule with classroom details',
    'Get the latest STI news from all over the network',
    'Access important academic resources anytime',
  ];

  contacts: Contact[] = [
    { label: 'Registrar', value: '(046) 417-8233' },
    { label: 'IT Support', value: 'itsupport@stibacoor.edu.ph' },
    { label: 'Student Affairs', value: 'studentaffairs@stibacoor.edu.ph' },
  ];

  constructor(private messageService: MessageService) {}

  copyToClipboard(contact: Contact) {
    if (typeof window === 'undefined') return;

    const text = contact.value;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Copied!',
            detail: `${contact.label} info copied to clipboard.`,
          });
        })
        .catch(() => {});
    }
  }
}