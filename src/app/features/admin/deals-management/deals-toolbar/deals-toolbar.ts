import { Component, input, output } from '@angular/core';
import { DealStatus } from '../../../../shared/models/deal';
import { SearchableSelect, SelectOption } from '../../../../shared/components/searchable-select/searchable-select';

export type DealStatusFilter = DealStatus | 'ALL';

const STATUS_OPTIONS: SelectOption[] = [
  { value: DealStatus.ACTIVE, label: 'Active' },
  { value: DealStatus.SUCCEEDED, label: 'Succeeded' },
  { value: DealStatus.FAILED, label: 'Failed' },
];

@Component({
  selector: 'app-deals-toolbar',
  imports: [SearchableSelect],
  templateUrl: './deals-toolbar.html',
})
export class DealsToolbar {
  search = input('');
  status = input<string>('ALL');

  searchChange = output<string>();
  statusChange = output<string>();

  readonly statusOptions = STATUS_OPTIONS;

  onStatusChange(value: string) {
    this.statusChange.emit(value);
  }
}
