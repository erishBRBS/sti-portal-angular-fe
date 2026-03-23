import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { SessionUser } from '../../../core/model/auth.model';
import {
  ParentStudentService,
  UpdateAdminProfileResponse,
  UpdateProfessorProfileResponse,
  UpdateStudentProfileResponse,
  UpdateParentProfileResponse,
} from '../../../services/general/my-profile.service';

type RoleType = 'admin' | 'professor' | 'student' | 'parent';

type UserProfileView = {
  id: number;
  role: RoleType;
  roleLabel: string;
  name: string;
  initials: string;
  email: string;
  imagePath: string;
  avatarUrl: string;
  course: string;
  yearLevel: string;
  section: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isEditing = false;
  isSaving = false;
  isUserReady = false;

  user: UserProfileView = {
    id: 0,
    role: 'admin',
    roleLabel: '',
    name: '',
    initials: '',
    email: '',
    imagePath: '',
    avatarUrl: '',
    course: '',
    yearLevel: '',
    section: '',
    firstName: '',
    lastName: '',
    fullName: '',
  };

  editableFirstName = '';
  editableLastName = '';
  editableFullName = '';

  private originalEditableFirstName = '';
  private originalEditableLastName = '';
  private originalEditableFullName = '';

  photoPreviewUrl: string | null = null;
  private lastObjectUrl: string | null = null;
  selectedPhotoFile: File | null = null;

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private profileService: ParentStudentService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearPreview();
  }

  private loadLoggedInUser(): void {
    this.authService.$user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: SessionUser | null) => {
        const raw = user as any;

        const firstName = raw?.first_name?.trim?.() || '';
        const lastName = raw?.last_name?.trim?.() || '';
        const fullName = raw?.full_name?.trim?.() || '';
        const username = raw?.username?.trim?.() || '';
        const email = raw?.email?.trim?.() || '';
        const imagePath = raw?.image_path?.trim?.() || '';
        const roleName = raw?.role_name?.trim?.() || '';
        const id = Number(raw?.id ?? 0);

        const course =
          raw?.course?.course_name?.trim?.() ||
          raw?.course_name?.trim?.() ||
          '';
        const yearLevel = String(raw?.year_level ?? '').trim() || '';
        const section =
          raw?.section?.section_name?.trim?.() ||
          raw?.section_name?.trim?.() ||
          '';

        let role: RoleType = 'admin';
        const normalizedRole = roleName.toLowerCase();

        if (normalizedRole.includes('student')) role = 'student';
        else if (normalizedRole.includes('parent')) role = 'parent';
        else if (normalizedRole.includes('professor') || normalizedRole.includes('teacher')) role = 'professor';
        else role = 'admin';

        let displayName = '';
        if (firstName || lastName) {
          displayName = `${firstName} ${lastName}`.trim();
        } else if (fullName) {
          displayName = fullName;
        } else if (username) {
          displayName = username;
        } else {
          displayName = 'User';
        }

        const fallbackAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
          displayName
        )}`;

        const avatarUrl = imagePath
          ? `${this.authService.$fileAPIUrl}${imagePath}?t=${Date.now()}`
          : fallbackAvatar;

        this.user = {
          id,
          role,
          roleLabel: roleName || role,
          name: displayName,
          initials: this.computeInitials(displayName),
          email,
          imagePath,
          avatarUrl,
          course,
          yearLevel,
          section,
          firstName,
          lastName,
          fullName,
        };

        this.editableFirstName = firstName;
        this.editableLastName = lastName;
        this.editableFullName = fullName || displayName;

        this.clearPreview();
        this.selectedPhotoFile = null;
        this.isEditing = false;
        this.isUserReady = true;
      });
  }

  startEdit(): void {
    this.originalEditableFirstName = this.editableFirstName;
    this.originalEditableLastName = this.editableLastName;
    this.originalEditableFullName = this.editableFullName;
    this.selectedPhotoFile = null;
    this.clearPreview();
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.editableFirstName = this.originalEditableFirstName;
    this.editableLastName = this.originalEditableLastName;
    this.editableFullName = this.originalEditableFullName;
    this.selectedPhotoFile = null;
    this.clearPreview();
    this.isEditing = false;
  }

  get currentAvatarUrl(): string {
    return this.photoPreviewUrl || this.user.avatarUrl;
  }

  get showStudentFields(): boolean {
    return this.user.role === 'student';
  }

  saveChanges(): void {
    if (!this.user.id) {
      this.toast.error('Error', 'Missing profile ID.');
      return;
    }

    this.isSaving = true;

    if (this.user.role === 'student') {
      const payload: UpdateStudentProfileResponse = {
        id: this.user.id,
        first_name: this.editableFirstName.trim(),
        last_name: this.editableLastName.trim(),
        image_path: this.user.imagePath,
        year_level: this.user.yearLevel,
        section_id: 0,
        user_role_id: 0,
      };

      this.profileService
        .updateStudent(this.user.id, payload, this.selectedPhotoFile)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: (response: any) => {
            const updated = response?.data ?? response;

            const newFirstName =
              updated.first_name ?? this.editableFirstName.trim();
            const newLastName =
              updated.last_name ?? this.editableLastName.trim();
            const newName = `${newFirstName} ${newLastName}`.trim();

            this.user.firstName = newFirstName;
            this.user.lastName = newLastName;
            this.user.name = newName;
            this.user.initials = this.computeInitials(newName);

            if (updated.image_path) {
              const newImagePath = updated.image_path;
              const newAvatarUrl = `${this.authService.$fileAPIUrl}${newImagePath}?t=${Date.now()}`;

              this.user.imagePath = newImagePath;
              this.user.avatarUrl = newAvatarUrl;

              this.authService.updateCurrentUser({
                first_name: newFirstName,
                last_name: newLastName,
                image_path: newImagePath,
                year_level: this.user.yearLevel,
                course: this.authService.currentUser?.course ?? null,
                section: this.authService.currentUser?.section ?? null,
                course_id: this.authService.currentUser?.course_id ?? null,
                section_id: this.authService.currentUser?.section_id ?? null,
              });
            } else {
              this.authService.updateCurrentUser({
                first_name: newFirstName,
                last_name: newLastName,
                year_level: this.user.yearLevel,
                course: this.authService.currentUser?.course ?? null,
                section: this.authService.currentUser?.section ?? null,
                course_id: this.authService.currentUser?.course_id ?? null,
                section_id: this.authService.currentUser?.section_id ?? null,
              });
            }

            this.editableFirstName = newFirstName;
            this.editableLastName = newLastName;
            this.isEditing = false;
            this.clearPreview();
            this.selectedPhotoFile = null;

            this.toast.success(
              'Profile Updated',
              'Your profile changes were saved.'
            );
          },
          error: () => {
            this.toast.error(
              'Update Failed',
              'Unable to save your profile.'
            );
          },
        });

      return;
    }

    if (this.user.role === 'parent') {
      const payload: UpdateParentProfileResponse = {
        id: this.user.id,
        first_name: this.editableFirstName.trim(),
        last_name: this.editableLastName.trim(),
        image_path: this.user.imagePath,
        user_role_id: 0,
      };

      this.profileService
        .updateParent(this.user.id, payload, this.selectedPhotoFile)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: (response: any) => {
            const updated = response?.data ?? response;

            const newFirstName =
              updated.first_name ?? this.editableFirstName.trim();
            const newLastName =
              updated.last_name ?? this.editableLastName.trim();
            const newName = `${newFirstName} ${newLastName}`.trim();

            this.user.firstName = newFirstName;
            this.user.lastName = newLastName;
            this.user.name = newName;
            this.user.initials = this.computeInitials(newName);

            if (updated.image_path) {
              const newImagePath = updated.image_path;
              const newAvatarUrl = `${this.authService.$fileAPIUrl}${newImagePath}?t=${Date.now()}`;

              this.user.imagePath = newImagePath;
              this.user.avatarUrl = newAvatarUrl;

              this.authService.updateCurrentUser({
                first_name: newFirstName,
                last_name: newLastName,
                image_path: newImagePath,
              });
            } else {
              this.authService.updateCurrentUser({
                first_name: newFirstName,
                last_name: newLastName,
              });
            }

            this.editableFirstName = newFirstName;
            this.editableLastName = newLastName;
            this.isEditing = false;
            this.clearPreview();
            this.selectedPhotoFile = null;

            this.toast.success(
              'Profile Updated',
              'Your profile changes were saved.'
            );
          },
          error: () => {
            this.toast.error(
              'Update Failed',
              'Unable to save your profile.'
            );
          },
        });

      return;
    }

    if (this.user.role === 'professor') {
      const payload: UpdateProfessorProfileResponse = {
        id: this.user.id,
        full_name: this.editableFullName.trim(),
        image_path: this.user.imagePath,
        user_role_id: 0,
      };

      this.profileService
        .updateProfessor(this.user.id, payload, this.selectedPhotoFile)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: (response: any) => {
            const updated = response?.data ?? response;

            const newFullName =
              updated.full_name ?? this.editableFullName.trim();

            this.user.fullName = newFullName;
            this.user.name = newFullName;
            this.user.initials = this.computeInitials(newFullName);

            if (updated.image_path) {
              const newImagePath = updated.image_path;
              const newAvatarUrl = `${this.authService.$fileAPIUrl}${newImagePath}?t=${Date.now()}`;

              this.user.imagePath = newImagePath;
              this.user.avatarUrl = newAvatarUrl;

              this.authService.updateCurrentUser({
                full_name: newFullName,
                image_path: newImagePath,
              });
            } else {
              this.authService.updateCurrentUser({
                full_name: newFullName,
              });
            }

            this.editableFullName = newFullName;
            this.isEditing = false;
            this.clearPreview();
            this.selectedPhotoFile = null;

            this.toast.success(
              'Profile Updated',
              'Your profile changes were saved.'
            );
          },
          error: () => {
            this.toast.error(
              'Update Failed',
              'Unable to save your profile.'
            );
          },
        });

      return;
    }

    const payload: UpdateAdminProfileResponse = {
      id: this.user.id,
      full_name: this.editableFullName.trim(),
      image_path: this.user.imagePath,
      user_role_id: 0,
    };

    this.profileService
      .updateAdmin(this.user.id, payload, this.selectedPhotoFile)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (response: any) => {
          const updated = response?.data ?? response;

          const newFullName =
            updated.full_name ?? this.editableFullName.trim();

          this.user.fullName = newFullName;
          this.user.name = newFullName;
          this.user.initials = this.computeInitials(newFullName);

          if (updated.image_path) {
            const newImagePath = updated.image_path;
            const newAvatarUrl = `${this.authService.$fileAPIUrl}${newImagePath}?t=${Date.now()}`;

            this.user.imagePath = newImagePath;
            this.user.avatarUrl = newAvatarUrl;

            this.authService.updateCurrentUser({
              full_name: newFullName,
              image_path: newImagePath,
            });
          } else {
            this.authService.updateCurrentUser({
              full_name: newFullName,
            });
          }

          this.editableFullName = newFullName;
          this.isEditing = false;
          this.clearPreview();
          this.selectedPhotoFile = null;

          this.toast.success(
            'Profile Updated',
            'Your profile changes were saved.'
          );
        },
        error: () => {
          this.toast.error(
            'Update Failed',
            'Unable to save your profile.'
          );
        },
      });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isTooLarge = file.size > 3 * 1024 * 1024;

    if (!isImage || isTooLarge) {
      this.toast.error('Invalid Photo', 'Please select an image under 3MB.');
      input.value = '';
      return;
    }

    this.selectedPhotoFile = file;

    if (this.lastObjectUrl) {
      URL.revokeObjectURL(this.lastObjectUrl);
    }

    this.lastObjectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl = this.lastObjectUrl;
    input.value = '';
  }

  private clearPreview(): void {
    if (this.lastObjectUrl) {
      URL.revokeObjectURL(this.lastObjectUrl);
    }
    this.lastObjectUrl = null;
    this.photoPreviewUrl = null;
  }

  private computeInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}