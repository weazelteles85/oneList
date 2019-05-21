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
import { IngredientList } from '../core/ingredient-list.interface';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  shoppingList: Subject<IngredientList> = new Subject<IngredientList>();
  checkedOffList: Subject<IngredientList> = new Subject<IngredientList>();

  shoppingListRef: AngularFirestoreDocument<any>;
  checkedOffListRef: AngularFirestoreDocument<any>;
  localShopping: Array<Ingredient> = [];
  localCheckedOff: Array<Ingredient> = [];


  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private sharing: SharingService) {
    // Get auth data, then get firestore ListOf Ingredient document || null
    this.authService.USER.subscribe(
      (user) => {
        this.checkIfInviteWasAccpeted();
        this.shoppingListRef = this.afs.doc(`shoppingLists/${user.email}`);
        this.checkedOffListRef = this.afs.doc(`checkedOffLists/${user.email}`);

        this.afs.doc<Array<Ingredient>>(this.shoppingListRef.ref).valueChanges().subscribe((list) => {
          if (list['ingredientList'] !== undefined) {
            console.log('value changed');
            this.localShopping = list['ingredientList'];
            this.shoppingList.next(list['ingredientList']);
          }
        });
        this.afs.doc<Array<Ingredient>>(this.checkedOffListRef.ref).valueChanges().subscribe((list) => {
          if (list['ingredientList'] !== undefined) {
            console.log('ValueChanged Called');
            this.localCheckedOff = list['ingredientList'];
            this.checkedOffList.next(list['ingredientList']);
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
    const ingredientList: IngredientList = { ingredientList: this.localShopping };
    this.shoppingListRef.set(ingredientList, { merge: true });
    if (this.authService.localUser.sharedEmails.emails.length > 0) {
      this.authService.localUser.sharedEmails.emails.forEach(otherEmail => {
        this.updateSharedLists('shoppingLists', otherEmail, this.localShopping);
      });
    }
  }

  updateCloudCheckedOffList() {
    const ingredientList: IngredientList = { ingredientList: this.localCheckedOff };
    this.checkedOffListRef.set(ingredientList, { merge: true });
    if (this.authService.localUser.sharedEmails.emails.length > 0) {
      this.authService.localUser.sharedEmails.emails.forEach(otherEmail => {
        this.updateSharedLists('checkedOffLists', otherEmail, this.localCheckedOff);
      });
    }
  }

  updateSharedLists(location: string, email: string, list: Array<Ingredient>) {
    const ingredientList: IngredientList = { ingredientList: list };
    const listRef = this.afs.collection(location).doc(email);
    listRef.set(ingredientList, { merge: true });
  }

  sortIngredientsByDate(arrayToSort: Array<Ingredient>) {
    return arrayToSort.sort((IngA, IngB) => {
      if (IngA.Date > IngB.Date) return -1;
      else if (IngA.Date < IngB.Date) return 1;
      else return 0;
    });
  }

  checkIfInviteWasAccpeted() {
    const editedUser = this.authService.localUser;
    if (this.authService.localUser.incomingRequests.emails.length > 0) {
      for (let index = 0; index < this.authService.localUser.incomingRequests.emails.length; index++) {
        const incomingEmail = this.authService.localUser.incomingRequests.emails[index];
        const requestedEmail = this.authService.localUser.requestedEmails.emails.find(e => e === incomingEmail);
        if (requestedEmail !== undefined) {
          editedUser.sharedEmails.emails.push(requestedEmail);
          editedUser.incomingRequests.emails.splice(index, 1);
          editedUser.requestedEmails.emails.splice(editedUser.requestedEmails.emails.indexOf(incomingEmail), 1);
        }
      }
      this.authService.updateUserData(editedUser);
    }
  }

  onShareShoppingListAccepted(email: string, index:number) {
    this.afs.collection('shoppingLists').doc(email).get().subscribe((listsDoc) => {
      const otherList: Array<Ingredient> = listsDoc.data()['ingredientLists'];
      this.localShopping = this.sharing.SyncShoppingLists(otherList, this.localShopping);
      this.updateCloudShoppingList();
      this.updateSharedLists('shoppingLists', email, this.localShopping);
      this.deleteIncomingRequest(index);
    });
  }

  deleteIncomingRequest(index: number) {
    const editedUser: User = this.authService.localUser;
    editedUser.incomingRequests.emails.splice(index, 1);
    this.authService.updateUserData(editedUser);
  }

  // **************   Shopping List Controls Bellow *******************

  addIngredient(name: string) {
    if (this.doesNameExist(name)) {
      if (this.localShopping === undefined) {
        this.localShopping = [];
      }
      this.localShopping.push({ Name: name, Date: Date.now() });
      this.localShopping = this.sortIngredientsByDate(this.localShopping);
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
