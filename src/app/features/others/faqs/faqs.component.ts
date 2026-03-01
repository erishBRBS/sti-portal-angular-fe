import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

type FAQ = { question: string; answer: string };

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './faqs.component.html',
  styles: [
    `
      :host ::ng-deep .p-accordionpanel,
      :host ::ng-deep .p-accordion-panel,
      :host ::ng-deep .p-accordionheader,
      :host ::ng-deep .p-accordion-header,
      :host ::ng-deep .p-accordionheader > a,
      :host ::ng-deep .p-accordion-header-link,
      :host ::ng-deep .p-accordioncontent,
      :host ::ng-deep .p-accordion-content,
      :host ::ng-deep .p-accordioncontent-content,
      :host ::ng-deep .p-accordion-content-content,
      :host ::ng-deep .p-accordionpanel-content,
      :host ::ng-deep .p-accordion-panel-content {
        background: transparent !important;
      }
      
      :host ::ng-deep .p-accordionpanel:not(:last-child),
      :host ::ng-deep .p-accordion-panel:not(:last-child) {
        border-bottom: 1px solid rgba(148, 163, 184, 0.35) !important; /* light */
      }

      html.dark :host ::ng-deep .p-accordionpanel:not(:last-child),
      html.dark :host ::ng-deep .p-accordion-panel:not(:last-child) {
        border-bottom: 1px solid rgba(51, 65, 85, 0.55) !important; /* dark */
      }

      html.dark :host ::ng-deep .p-accordiontoggleicon {
        color: rgba(226, 232, 240, 0.8) !important;
      }
    `,
  ],
})
export class FaqsComponent {
  faqs: FAQ[] = [
    {
      question: 'How to log-in',
      answer:
        'Sign-in using your STI Microsoft Office 365 account. Check your Registration Form for details.',
    },
    {
      question: 'My email account is not working',
      answer:
        'Ensure you use the new format (@sti.edu.ph). Contact the Registrar if your record needs linking.',
    },
    {
      question: 'Grades Visibility',
      answer: 'Grades are encoded by instructors. If missing, please contact your subject teacher.',
    },
    {
      question: 'Class Schedule',
      answer: "Confirm schedules through the Registrar's Office for room or time discrepancies.",
    },
    {
      question: 'Portal not loading',
      answer: 'Try clearing browser cache or using a different browser (Chrome/Edge recommended).',
    },
  ];

  activeValues: string[] = ['0'];
}
