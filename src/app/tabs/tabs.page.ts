import { Component, AfterViewInit, OnInit } from '@angular/core';
import { DataStorageService } from '../services/data-storage.service';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, AfterViewInit {

  iconSubject: Subject<string> = new Subject<string>();

  

  constructor(public authService: AuthService, public dataStorage: DataStorageService) { 
    this.iconSubject.subscribe((icon) => {
      next: (newIcon) => {icon = newIcon; console.log(`inside Next: ${newIcon}`)}
      console.log('inside iconSub Subscribe');
    });
  }

  ngOnInit() {
    this.iconSubject.next('cog');
    this.authService.USER.subscribe((user) => {
      console.log('inside USER.subscribe');
      this.dataStorage.shoppingList.subscribe((list) => {
        if (list) {
          // if (this.dataStorage.listOfIncomingRequest.length > 0) {
          //   this.iconSubject.next('alert');
          // }
          // else {
          //   this.iconSubject.next('cog');
          // }
        }
      })
    });
  }

  ngAfterViewInit() {
    this.iconSubject.subscribe();
  }


}
