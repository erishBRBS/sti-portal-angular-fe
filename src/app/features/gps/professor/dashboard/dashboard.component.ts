import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatCard = {
  label: string;
  value: string;
  icon: string;      // PrimeIcons class
  bgColor: string;   // Tailwind bg
  darkBg: string;    // Tailwind dark bg
  iconColor: string; // Tailwind text color (including dark)
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
  todayDate = '';

  // ✅ Keep only Total Students + Announcements
  stats: StatCard[] = [
    {
      label: 'Total Students',
      value: '142',
      icon: 'pi pi-users',
      bgColor: 'bg-green-100',
      darkBg: 'dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Announcements',
      value: '8',
      icon: 'pi pi-megaphone',
      bgColor: 'bg-orange-100',
      darkBg: 'dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  // ✅ Keep only announcements (remove schedule)
  announcements: AnnouncementItem[] = [
    {
      title: 'Midterm Exam Schedule Released',
      content: 'Midterm examinations will be held from Oct 15-20. Check your schedule for specific dates.',
      time: '2 hours ago',
    },
    {
      title: 'Grade Submission Deadline',
      content: 'Please submit all prelim grades by October 10, 2025. Late submissions require approval.',
      time: '1 day ago',
    },
    {
      title: 'Faculty Meeting',
      content: 'Department meeting scheduled for Oct 8 at 3:00 PM in Conference Room A.',
      time: '3 days ago',
    },
  ];

  ngOnInit(): void {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.todayDate = new Date().toLocaleDateString('en-US', options);
  }
}