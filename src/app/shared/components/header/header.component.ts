import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, BadgeModule, TooltipModule, RouterModule],
  templateUrl: './header.component.html',
  styles: [`
    :host ::ng-deep .p-avatar.p-avatar-lg {
      width: 2.5rem;
      height: 2.5rem;
    }
  `],
})
export class HeaderComponent implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  isDarkMode = false;
  lastName = 'Prof. Santos';
  currentDate = new Date();
  greeting = '';

  ngOnInit() {
    this.setGreeting();

    if (typeof window === 'undefined') return;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      this.applyTheme(true);
    }
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  toggleTheme() {
    this.applyTheme(!this.isDarkMode);
  }

  private applyTheme(dark: boolean) {
    this.isDarkMode = dark;

    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;

    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}