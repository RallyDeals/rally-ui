import { Pipe, PipeTransform } from '@angular/core';

export interface AvatarInfo {
  initials: string;
  color: string;
}

const AVATAR_COLORS = ['#f97316', '#006c49', '#be0037', '#9d4300', '#7c4dff', '#00796b'];

@Pipe({
  name: 'avatar',
  standalone: true,
  pure: true,
})
export class AvatarPipe implements PipeTransform {
  transform(fullName: string | null | undefined): AvatarInfo {
    const name = (fullName ?? '').trim();
    if (!name) {
      return { initials: '?', color: AVATAR_COLORS[0] };
    }

    const parts = name.split(/\s+/).filter(Boolean);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

    return { initials, color };
  }
}
