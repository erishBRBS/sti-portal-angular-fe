import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../../auth/components/login-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LoginModalComponent],
  templateUrl: './landing.page.html',
})
export class LandingPage implements OnInit, OnDestroy {
  // ---------------- FAQ ----------------
  faqItems = [
    {
      question: 'How do I use my RFID tag for attendance?',
      answer:
        'Simply tap your student ID card on the RFID reader located at the classroom entrance. The system will record your attendance in real-time and notify your instructor. Ensure the card is within 2-3cm of the reader for a successful scan.',
      isOpen: false,
    },
    {
      question: 'What should I do if I lose my Student ID?',
      answer:
        'Report lost ID cards immediately to the Registrar or Security Office. Once reported, the old RFID tag will be deactivated to prevent unauthorized gate entry, and a replacement card with a new unique ID will be issued.',
      isOpen: false,
    },
    {
      question: 'How do parents receive attendance notifications?',
      answer:
        'Notifications are automatically sent via the Semaphore SMS gateway and email as soon as a student taps their ID at the main gate. Parents can update their contact information through the Parent Portal to ensure they receive these alerts.',
      isOpen: false,
    },
    {
      question: 'Why can’t I view my grades in the portal?',
      answer:
        'Grade viewing is enabled once the accounting office clears your tuition balance. If your balance is settled and you still cannot see your grades, please contact the Registrar for system access assistance.',
      isOpen: false,
    },
    {
      question: 'Is the facial recognition at the gate mandatory?',
      answer:
        'Yes, the identity verification system at the gate uses facial recognition alongside your ID scan for enhanced campus security. This ensures that the person entering the campus is the actual owner of the ID being used.',
      isOpen: false,
    },
  ];

  toggleFaq(index: number) {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }

  getQuestionIcon(question: string): string {
    if (question.toLowerCase().includes('rfid') || question.toLowerCase().includes('attendance')) return 'fa-id-badge';
    if (question.toLowerCase().includes('lost') || question.toLowerCase().includes('id')) return 'fa-exclamation-triangle';
    if (question.toLowerCase().includes('parents') || question.toLowerCase().includes('notifications')) return 'fa-sms';
    if (question.toLowerCase().includes('grades') || question.toLowerCase().includes('portal')) return 'fa-graduation-cap';
    if (question.toLowerCase().includes('facial') || question.toLowerCase().includes('security')) return 'fa-user-shield';
    return 'fa-question-circle';
  }

  getProTip(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('rfid')) return 'Avoid bending your ID card, as it might damage the internal RFID antenna.';
    if (q.includes('lost')) return 'A temporary gate pass can be requested at the guard house while waiting for a replacement.';
    if (q.includes('parents')) return 'Standard network rates may apply for SMS alerts depending on your service provider.';
    if (q.includes('grades')) return 'You can download a PDF copy of your unofficial grade slip directly from the portal.';
    if (q.includes('facial')) return 'Remove hats or heavy tinted glasses when approaching the gate camera for faster verification.';
    return 'Contact the ICT department for technical issues regarding your portal account.';
  }

  getResources(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('rfid')) return 'Attendance Manual • RFID Scanner Locations';
    if (q.includes('lost')) return 'Replacement Form • ID Fee Schedule';
    if (q.includes('parents')) return 'SMS Setup Guide • Parent Portal Login';
    if (q.includes('grades')) return 'Accounting Clearance • Registrar Contacts';
    if (q.includes('facial')) return 'Campus Security Policy • Privacy Guidelines';
    return 'User Handbook • Support Ticket • Office Directory';
  }

  // ---------------- Gallery ----------------
  campusImages = [
    {
      src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'Gate Entry Terminal',
      title: 'Gate Entry Verification',
      description: 'Facial recognition and RFID integration at the STI Bacoor main entrance.',
    },
    {
      src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'Real-time Attendance',
      title: 'RFID Attendance Logs',
      description: 'Automated classroom logging system with sub-second processing speed.',
    },
    {
      src: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'SMS Notification System',
      title: 'Parent Alert System',
      description: 'Real-time SMS notifications sent via Semaphore API for student security.',
    },
    {
      src: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'Admin Control Center',
      title: 'Centralized Dashboard',
      description: 'Master control panel for administrators to manage student and faculty records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'Student Grade Portal',
      title: 'Academic Grade Portal',
      description: 'Secure access for students to view preliminary and final grades.',
    },
    {
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&h=400&q=80',
      alt: 'System Security',
      title: 'Security & Audit Logs',
      description: 'Complete transparency of all gate and portal activity for campus safety.',
    },
  ];

  currentImageIndex = 0;
  touchStartX = 0;
  private autoSlideInterval: any;

  get visibleImages() {
    const images: any[] = [];
    for (let i = 0; i < 4; i++) {
      const index = (this.currentImageIndex + i) % this.campusImages.length;
      images.push({ ...this.campusImages[index], position: i, isFeatured: i === 0 });
    }
    return images;
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.campusImages.length;
  }

  prevImage() {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.campusImages.length) % this.campusImages.length;
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  getBackgroundClass(position: number): string {
    switch (position) {
      case 2:
        return 'pos-2';
      case 3:
        return 'pos-3';
      default:
        return '';
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchEndX - this.touchStartX;
    if (Math.abs(diff) > 50) diff > 0 ? this.prevImage() : this.nextImage();
  }

  // ---------------- Header / Scroll ----------------
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isMobileMenuOpen = false;
  }

  // ---------------- Login modal ----------------
  isLoginModalOpen = false;

  openLoginModal() {
    this.isLoginModalOpen = true;
  }

  closeModal() {
    this.isLoginModalOpen = false;
  }

  // ---------------- Scroll animations ----------------
  private scrollObserver: IntersectionObserver | null = null;

  ngOnInit() {
    this.autoSlideInterval = setInterval(() => this.nextImage(), 4000);

    setTimeout(() => this.initScrollAnimations(), 100);
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    if (this.scrollObserver) this.scrollObserver.disconnect();
  }

  private initScrollAnimations() {
    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      this.scrollObserver?.observe(el);
    });
  }
}