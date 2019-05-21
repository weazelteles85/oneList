import { Component, AfterViewInit, OnInit } from '@angular/core';
import { DataStorageService } from '../services/data-storage.service';
import { AuthService } from '../services/auth.service';
import { Subject, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, AfterViewInit {

  iconSubject: ReplaySubject<string> = new ReplaySubject<string>(1);

  

  constructor(public authService: AuthService, public dataStorage: DataStorageService) { 
    // this.iconSubject.subscribe((icon) => {
    //   next: (newIcon) => {icon = newIcon; console.log(`inside Next: ${newIcon}`)}
    // });
  }

  ngOnInit() {
    this.iconSubject.next('cog');
    this.authService.USER.subscribe((user) => {
      this.dataStorage.shoppingList.subscribe((list) => {
        if (list) {
          if (this.authService.localUser.incomingRequests.emails.length > 0) {
            this.iconSubject.next('alert');
          }
          else {
            this.iconSubject.next('cog');
          }
        }
      })
    });
  }

  ngAfterViewInit() {
    this.iconSubject.subscribe();
  }


}
