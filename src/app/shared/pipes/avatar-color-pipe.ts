import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarColor'
})
export class AvatarColorPipe implements PipeTransform {

  private readonly avatarColors = [
    '#0052CC', '#0747A6', '#0065FF', '#2684FF', 
    '#00875A', '#36B37E', '#FFAB00', '#FF5630', 
    '#6554C0', '#5243AA', '#FF8B00', '#00B8D9'
  ];

  transform(userId?:string | null): string {
     if(userId == null){
      return '#0515240F';
    }

    let hash = 0;
    
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

}
