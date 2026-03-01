import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent, HeaderComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  mobileNavOpen = false;

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;

    // prevent background scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.mobileNavOpen ? 'hidden' : '';
    }
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}