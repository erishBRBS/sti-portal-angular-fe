import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'yellow';
}

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
}

interface TodayClass {
  time: string;
  course: string;
  section: string;
  professor: string;
}

interface Announcement {
  title: string;
  date: string;
  content: string;
  isNew: boolean;
  hasImage: boolean;
  details: string;
}

interface Student {
  id: string;
  name: string;
  course: string;
  avatar: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class ParentDashboardComponent implements OnInit {
  selectedStudent: string = 'hadassa';
  private router = inject(Router);

  students: Student[] = [
    {
      id: 'hadassa',
      name: 'Hadassa Yap',
      course: 'IT Student - BS Information Technology',
      avatar: 'HY',
    },
    { id: 'john', name: 'John Yap', course: 'BS Computer Science', avatar: 'JY' },
    { id: 'sarah', name: 'Sarah Yap', course: 'Senior High School', avatar: 'SY' },
  ];

  stats: Stat[] = [
    { label: 'Current GPA', value: '3.25', icon: 'pi pi-chart-line', color: 'blue' },
    { label: 'Classes Today', value: '2', icon: 'pi pi-clock', color: 'purple' },
  ];

  quickActions: QuickAction[] = [
    {
      label: "Child's Grades",
      icon: 'pi pi-star',
      action: 'viewGrades',
      route: '/gps/parent/childs-grade',
    },
    {
      label: 'Class Schedule',
      icon: 'pi pi-clock',
      action: 'viewSchedule',
      route: '/gps/parent/childs-schedule',
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      action: 'viewAnnouncements',
      route: '/general/announcements',
    },
  ];

  todayClasses: TodayClass[] = [
    {
      time: '10:00AM - 1:00PM',
      course: 'Programming Languages',
      section: 'Room 206',
      professor: 'Junkate Lindon Bernabe',
    },
    {
      time: '1:00PM - 3:00PM',
      course: 'Web Systems & Tech',
      section: 'Room 206',
      professor: 'Enrico Enerlan',
    },
  ];

  announcements: Announcement[] = [
    {
      title: 'Graduation Day Announcement',
      date: 'Today',
      content:
        "In celebration of our Senior High School and Tertiary students' graduation, all office transactions will be suspended tomorrow, July 3, 2025.",
      isNew: true,
      hasImage: true,
      details: `Office Transactions will resume on Friday, July 4, 2025:
ADMISSIONS OFFICE - 8AM-5PM
OTHER OFFICE TRANSACTIONS - 1PM - 5PM
Thank you for your kind understanding and support as we honor this milestone with our graduates!
Happy Graduation!`,
    },
  ];

  navItems = [
    { label: 'Dashboard', icon: 'fas fa-home', link: '#', active: true },
    { label: "Child's Grades", icon: 'fas fa-star', link: '#', active: false },
    { label: "Child's Schedule", icon: 'fas fa-clock', link: '#', active: false },
    { label: 'Announcements', icon: 'fas fa-bullhorn', link: '#', active: false },
  ];

  otherNavItems = [
    { label: 'Mission, Vision & STI Hymn', icon: 'fas fa-bookmark', link: '#' },
    { label: 'Feedback', icon: 'fas fa-comment', link: '#' },
    { label: 'About', icon: 'fas fa-info-circle', link: '#' },
    { label: 'FAQs', icon: 'fas fa-question-circle', link: '#' },
  ];

  ngOnInit() {}

  onStudentChange(studentId: string) {
    console.log('Selected student:', studentId);
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }
  getNavItemClass(active: boolean): string {
    const baseClass = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all';
    if (active) {
      return `${baseClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`;
    }
    return `${baseClass} text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50`;
  }

  toggleSidebar() {}
}
