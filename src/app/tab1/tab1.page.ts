import { Component, AfterContentChecked, AfterContentInit, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Ingredient } from '../core/ingredient';
import { DataStorageService } from '../services/data-storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { SharingService } from '../services/sharing.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  addItemForm: FormGroup

  constructor(private authService: AuthService,
    private router: Router,
    public dataStorage: DataStorageService,
    public sharing: SharingService) {
    this.authService.USER.subscribe((user) => {
      if(!user || user == null) {
        console.log('not logged in');
        this.router.navigate(['/login']);
      }
      else {
        //this.dataStorage.shoppingList.subscribe();
      }
    })
  }

  ngOnInit() {
    this.addItemForm = new FormGroup({
      'item': new FormControl('')
    })
  }

  onAddItem() {
    this.addIngredient(this.addItemForm.get('item').value);
    this.addItemForm.get('item').setValue('');
    window.scrollTo(0,document.body.scrollHeight);
  }

  addIngredient(name:string) {
    this.dataStorage.addIngredient(name);
  }

  onCheckOffItem(index:number) {
    this.dataStorage.checkOffItem(index);
  }

  onUndoCheckOff(index:number) {
    this.dataStorage.undoCheckOff(index);
  }

  onDeleteItem(index:number) {
    this.dataStorage.deleteCheckedOffItem(index);
  }


  testDebug(vars) {
    console.log('test called');
    console.log(vars);
  }
  
}
