import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';

type Option<T = any> = { label: string; value: T };
export type AdminModalMode = 'add' | 'edit';

@Component({
  selector: 'sti-admin-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    SelectButtonModule
  ],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.css',
})
export class AdminModalComponent {
   private fb = inject(FormBuilder);

  // two-way dialog open/close
  @Input() visible = false;
  @Input() mode: AdminModalMode = 'add';
  @Input() initialData: any | null = null;
  @Input() titleOverride?: string;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<any>();

  get dialogTitle(): string {
    if (this.titleOverride?.trim()) return this.titleOverride;
    return this.mode === 'edit' ? 'Update Admin' : 'Add Admin';
  }


  // mock options (replace with API-driven options)
  videoTypeOptions: Option<string>[] = [
    { label: 'Lecture', value: 'lecture' },
    { label: 'Training', value: 'training' },
    { label: 'Webinar', value: 'webinar' },
  ];

  sdgOptions: Option<number>[] = Array.from({ length: 17 }).map((_, i) => ({
    label: `SDG ${i + 1}`,
    value: i + 1,
  }));

  tierOptions: Option<string>[] = [
    { label: 'Tier 1', value: 'tier1' },
    { label: 'Tier 2', value: 'tier2' },
    { label: 'Tier 3', value: 'tier3' },
  ];

  level1Options: Option<string>[] = [
    { label: 'Level 1 - A', value: 'l1a' },
    { label: 'Level 1 - B', value: 'l1b' },
  ];

  level2Options: Option<string>[] = [
    { label: 'Level 2 - A', value: 'l2a' },
    { label: 'Level 2 - B', value: 'l2b' },
  ];

  level3Options: Option<string>[] = [
    { label: 'Level 3 - A', value: 'l3a' },
    { label: 'Level 3 - B', value: 'l3b' },
  ];

  sourceOptions: Option<'local' | 'external'>[] = [
    { label: 'Local', value: 'local' },
    { label: 'External', value: 'external' },
  ];

  form = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    mobile_number: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    shortDescription: ['', [Validators.required]],
    videoType: [null as string | null, [Validators.required]],
    sdgs: [[] as number[]],
    tier: [null as string | null, [Validators.required]],
    level1: [null as string | null],
    level2: [null as string | null],
    level3: [null as string | null],
    keywords: [''],
    source: ['local' as 'local' | 'external'],
  });

  // MARK: - For Button action
  close() {
    this.visibleChange.emit(false);
      this.form.reset({
      full_name: '',
      email: '',
      mobile_number: '',
      username: '',
      password: null,
      shortDescription: '',
      videoType: null,
      sdgs: [],
      tier: null,
      level1: null,
      level2: null,
      level3: null,
      keywords: '',
      source: 'local',
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // send raw payload to parent
    this.saved.emit(this.form.getRawValue());

    // optional: close after save
    this.close();
  }

  // simple helpers
  isInvalid(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
