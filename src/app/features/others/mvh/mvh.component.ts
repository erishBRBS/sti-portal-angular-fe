import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-mvh',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './mvh.component.html',
  styles: [
    `
      @media print {
        button,
        p-toast {
          display: none !important;
        }

        .print-white {
          background: white !important;
          color: black !important;
          border: 1px solid #eee !important;
        }

        .print-black {
          color: black !important;
        }
      }

      .animate-pulse-slow {
        animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class MvhComponent implements OnDestroy {
  isPlaying = false;
  private audio?: HTMLAudioElement;

  constructor(private toast: ToastService) {}

  private ensureAudio(): void {
    if (typeof window === 'undefined') return;
    if (this.audio) return;

    // ✅ public/assets/sti-hymn.mp3 -> served as /assets/sti-hymn.mp3
    this.audio = new Audio('/assets/sti-hymn.mp3');
    this.audio.preload = 'metadata';

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.toast.info('Finished', 'STI Hymn ended.');
    });
  }

  async toggleHymn() {
    this.ensureAudio();
    if (!this.audio) return;

    try {
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
        this.toast.warn('Audio Paused', 'STI Hymn playback stopped.');
        return;
      }

      // (optional) restart from beginning every time you press Play
      // this.audio.currentTime = 0;

      await this.audio.play(); // must be triggered by click (OK)
      this.isPlaying = true;
      this.toast.info('Audio Started', 'STI Hymn is now playing...');
    } catch (e) {
      this.isPlaying = false;
      this.toast.error('Cannot Play', 'Audio blocked or file not found.');
      // console.error(e);
    }
  }

  printHymn() {
    if (typeof window === 'undefined') return;
    window.print();
  }

  async shareHymn() {
    if (typeof window === 'undefined') return;

    const payload = {
      title: 'STI Mission, Vision & Hymn',
      text: 'Check out the core values of STI Bacoor!',
      url: window.location.href,
    };

    if (navigator?.share) {
      try {
        await navigator.share(payload);
        this.toast.success('Shared', 'Thanks for sharing!');
      } catch {}
      return;
    }

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload.url);
        this.toast.success('Copied!', 'Link copied to clipboard.');
      } catch {
        this.toast.error('Copy Failed', 'Could not copy the link.');
      }
      return;
    }

    this.toast.info('Share', 'Sharing is not supported on this browser.');
  }

  ngOnDestroy(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.src = '';
    this.audio.load();
    this.audio = undefined;
  }
}