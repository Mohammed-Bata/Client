import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) return 'U';

    const parts = name.trim().split(/\s+/); // Splits by any whitespace
    
    if (parts.length >= 2) {
      // Return first letter of first name and first letter of last name
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // If only one name, return the first two letters of that name
    return parts[0].substring(0, 2).toUpperCase();
  }
}
