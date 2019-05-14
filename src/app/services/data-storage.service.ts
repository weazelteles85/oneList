import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, from, Subject, ReplaySubject } from 'rxjs';
import { switchMap, } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '../core/user';
import { Ingredient } from '../core/ingredient';
import { AuthService } from './auth.service';
import { SharingService } from './sharing.service';
import { ComponentFactoryResolver } from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  // unsavedShopping: Array<Ingredient>;
  // unsavedCheckedOff: Array<Ingredient>;

  // isInitialized: boolean;
  shoppingList: ReplaySubject<Array<Ingredient>> = new ReplaySubject<Array<Ingredient>>(3);
  checkedOffList: ReplaySubject<Array<Ingredient>> = new ReplaySubject<Array<Ingredient>>(3);

  shoppingListRef: AngularFirestoreDocument<any>;
  checkedOffListRef: AngularFirestoreDocument<any>;
  // localUser: User;
  // localListOfIngredients: Array<Ingredient> = [];
  // localListOfCheckedOff: Array<Ingredient> = [];
  // listOfIncomingRequest: Array<string> = [];
  // cancelShareRequests: Array<string> = [];
  // localShopping: Array<string> = ['test'];
  // localCheckedOff: Array<Ingredient>;
  localShopping: Array<Ingredient> = [];
  localCheckedOff: Array<Ingredient> = [];


  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private sharing: SharingService) {
    // Get auth data, then get firestore ListOf Ingredient document || null
    this.authService.USER.subscribe(
      (user) => {
        this.shoppingListRef = this.afs.doc(`shoppingLists/${user.email}`);
        this.checkedOffListRef = this.afs.doc(`checkedOffList/${user.email}`);

        this.afs.doc<Array<Ingredient>>(this.shoppingListRef.ref).valueChanges().subscribe((list) => {
          if (list !== undefined) {
            this.localShopping = list['shoppingList'];
            this.shoppingList.next(list['shoppingList']);
          }
        });
        this.afs.doc<Array<Ingredient>>(this.checkedOffListRef.ref).valueChanges().subscribe((list) => {
          if (list !== undefined) {
            console.log('local checked off list = ');
            console.log(list);
            this.localCheckedOff = list['checkedOffList'];
            console.log(this.localCheckedOff);
            this.checkedOffList.next(list['checkedOffList']);
          }
        });
        // Initialize App for First time if
        if (!user.isAppsInitialized) {
          console.log('Initializing App for First time');
          this.updateCloudShoppingList();
          this.updateCloudCheckedOffList();
          const editedUser = user;
          editedUser.isAppsInitialized = true;
          this.authService.updateUserData(editedUser);
        }
      }
    );
  }

  updateCloudShoppingList() {
    const shoppingListObj = {shoppingList: this.localShopping };
    this.shoppingListRef.set(shoppingListObj, { merge: true });
  }

  updateCloudCheckedOffList() {
    const checkedOffListObj = { checkedOffList: this.localCheckedOff };
    console.log('Checked Off to cloud called');
    console.log(checkedOffListObj);
    this.checkedOffListRef.set(checkedOffListObj, { merge: true });
  }

  sortIngredientsByDate(arrayToSort: Array<Ingredient>) {
    return arrayToSort.sort((IngA, IngB) => {
      if (IngA.Date > IngB.Date) return -1;
      else if (IngA.Date < IngB.Date) return 1;
      else return 0;
    });
  }

  updateSharedLists() {

  }

  checkIfInviteWasAccpeted(email: string) {
    
  }

  deleteIncomingRequest(index: number) {

  }

  // **************   Shopping List COntrols Bellow *******************

  addIngredient(name: string) {
    if (this.doesNameExist(name)) {
      if (this.localShopping === undefined) {
        this.localShopping = [];
      }
      this.localShopping.push({Name: name, Date: Date.now()});
      console.log('Added to Shopping LISt');
      this.updateCloudShoppingList();
    }
  }

  checkOffItem(index: number) {
    if (this.localCheckedOff === undefined) {
      this.localCheckedOff = [];
    }
    const ingredient: Ingredient = this.localShopping.splice(index, 1)[0];
    this.localCheckedOff.push(ingredient);
    this.updateCloudShoppingList();
    this.updateCloudCheckedOffList();
  }

  undoCheckOff(index: number) {
    if (this.localShopping === undefined) {
      this.localShopping = [];
    }
    const ingredient: Ingredient = this.localCheckedOff.splice(index, 1)[0];
    this.localShopping.push(ingredient);
    this.updateCloudShoppingList();
    this.updateCloudCheckedOffList();
  }

  deleteCheckedOffItem(index: number) {
    this.localCheckedOff.splice(index, 1);
    this.updateCloudCheckedOffList();
  }

  doesNameExist(itemName: string): boolean {
    return this.localShopping.find(l => l.Name === itemName) === undefined;
  }

  private deleteItemInShoppingList(index: number) {
    //this.localListOfIngredients.splice(index, 1);
  }



}
