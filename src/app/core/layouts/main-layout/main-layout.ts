import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/authservice';
import { UIService } from '../../services/uiservice';


@Component({
  selector: 'app-main-layout',
  imports: [Navbar,Sidebar,RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout
{
  constructor(public uiservice:UIService){}
}
