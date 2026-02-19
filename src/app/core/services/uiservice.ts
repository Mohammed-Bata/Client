import { Injectable, signal } from "@angular/core";


@Injectable({
    providedIn: 'root',
})

export class UIService{
  currentTheme = signal<string>(localStorage.getItem('theme') || 'light');
  sidebarOpen = signal(true);

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    localStorage.setItem('theme', newTheme);
    this.applyTheme(newTheme);
  }

  setTheme(theme:string){
    if(this.currentTheme() === theme){
      return;
    }
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: string) {
    // We apply the attribute to the document element (HTML tag)
    document.documentElement.setAttribute('data-theme', theme);
  }

    toggleSideBar(){
        this.sidebarOpen.update(v=>!v);
    }

    closeSidebar() {
    this.sidebarOpen.set(false);
  }

  openSidebar() {
    this.sidebarOpen.set(true);
  }
}