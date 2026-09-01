import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { UserToolbar } from './user-toolbar/user-toolbar';
import { UserRow } from './user-row/user-row';
import { UserService } from '../../auth/admin-user.service';
import { BuyerStatus, User, UserType } from '../../../shared/models/user';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-user-management',
  imports: [PageHeader, UserToolbar, UserRow, Pagination, ErrorState, ErrorModal],
  templateUrl: './user-management.html',
})
export class UserManagement implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  total = signal(0);
  loading = signal(true);
  loadError = signal<ApiError | null>(null);
  actionError = signal<ApiError | null>(null);
  search = signal('');
  selectedTypes = signal<Set<UserType>>(new Set());
  selectedStatuses = signal<Set<BuyerStatus>>(new Set());
  page = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  rangeEnd = computed(() => Math.min(this.page() * PAGE_SIZE, this.total()));

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.loadError.set(null);
    this.userService
      .getUsers({
        search: this.search(),
        types: Array.from(this.selectedTypes()),
        statuses: Array.from(this.selectedStatuses()),
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loadError.set(toApiError(err));
          this.loading.set(false);
        },
      });
  }

  onSearchChange = (value: string) => {
    this.search.set(value);
    this.page.set(1);
    this.loadUsers();
  };

  onTypesChange = (types: Set<UserType>) => {
    this.selectedTypes.set(types);
    this.page.set(1);
    this.loadUsers();
  };

  onStatusesChange = (statuses: Set<BuyerStatus>) => {
    this.selectedStatuses.set(statuses);
    this.page.set(1);
    this.loadUsers();
  };

  onPageChange = (page: number) => {
    this.page.set(page);
    this.loadUsers();
  };

  onToggleUserStatus = (user: User) => {
    this.actionError.set(null);
    const nextStatus = user.status === 'active' ? 'banned' : 'active';
    const request$ = nextStatus === 'banned' ? this.userService.banBuyer(user.id) : this.userService.activateBuyer(user.id);
    request$.subscribe({
      next: () => {
        this.users.update((users) => users.map((existing) => (existing.id === user.id ? { ...existing, status: nextStatus } : existing)));
      },
      error: (err) => {
        this.actionError.set(toApiError(err));
      },
    });
  };

  closeActionError = () => {
    this.actionError.set(null);
  };
}
