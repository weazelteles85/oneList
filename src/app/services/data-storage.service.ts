import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ReplaySubject } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../core/user';
import { Ingredient } from '../core/ingredient';
import { AuthService } from './auth.service';
import { SharingService } from './sharing.service';
import { IngredientList } from '../core/ingredient-list.interface';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  shoppingList: ReplaySubject<IngredientList> = new ReplaySubject<IngredientList>(1);
  checkedOffList: ReplaySubject<IngredientList> = new ReplaySubject<IngredientList>(1);
  checkedOffListKey = 'ckeckedOffList';

  shoppingListRef: AngularFirestoreDocument<any>;
  checkedOffListRef: AngularFirestoreDocument<any>;
  localShopping: Array<Ingredient> = [];
  localCheckedOff: Array<Ingredient> = [];

  constructor(private afAuth: AngularFireAuth,
    private localStorage: Storage,
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
            const newList: Array<Ingredient> = list['ingredientList'];
            if (newList.length < this.localShopping.length && list['updatedBy'] !== this.authService.localUser.email) {
              const missingIngredient: Array<Ingredient> = this.sharing.getMissingIngredient(newList, this.localShopping);
              //this.checkOffItem(this.localShopping.findIndex(i => i.Name === missingIngredient[0].Name));
              this.localCheckedOff = this.localCheckedOff.concat(missingIngredient);
              this.checkedOffList.next(<IngredientList><unknown>this.localCheckedOff);
              this.updateCheckedOffList();
            }
            this.localShopping = list['ingredientList'];
            this.shoppingList.next(list['ingredientList']);
          }
        });
        this.localStorage.get(this.checkedOffListKey).then((list) => {
          console.log(list['ingredientList']);
          this.localCheckedOff = list['ingredientList'];
          this.checkedOffList.next(list['ingredientList']);
        }).catch(err => console.error(err));

        if (!user.isAppsInitialized) {
          console.log('Initializing App for First time');
          this.updateCloudShoppingList();
          this.updateCheckedOffList();
          const editedUser = user;
          editedUser.isAppsInitialized = true;
          this.authService.updateUserData(editedUser);
        }
      }
    );
  }

  updateCloudShoppingList() {
    const ingredientList: IngredientList = { updatedBy: this.authService.localUser.email, ingredientList: this.localShopping };
    this.shoppingListRef.set(ingredientList, { merge: true });
    if (this.authService.localUser.sharedEmails.emails.length > 0) {
      this.authService.localUser.sharedEmails.emails.forEach(otherEmail => {
        this.updateSharedLists(otherEmail, this.localShopping);
      });
    }
  }

  updateCheckedOffList() {
    const ingredientList: IngredientList = { updatedBy: this.authService.localUser.email, ingredientList: this.localCheckedOff };
    this.localStorage.set(this.checkedOffListKey, ingredientList);
  }

  updateSharedLists(email: string, list: Array<Ingredient>) {
    this.sharing.updateSharedEmails(email, list);
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

  onShareShoppingListAccepted(email: string, index: number) {
    this.afs.collection('shoppingLists').doc(email).get().subscribe((listsDoc) => {
      const otherList = listsDoc.data()['ingredientList'];
      this.localShopping = this.sharing.SyncShoppingLists(otherList, this.localShopping);
      const editedUser: User = this.authService.localUser;
      editedUser.sharedEmails.emails.push(email);
      editedUser.sharedEmails.isSynced = false; // <-- informs that this users lists need to be synced.
      editedUser.incomingRequests.emails.splice(index, 1);
      this.authService.updateUserData(editedUser); //<--Updates User On Server with new shared email data
      this.sharing.sendNewShareRequest(email, false); // <-- Sends a new function to the original caller requesting invite
      this.updateCloudShoppingList();
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
    this.updateCheckedOffList();
  }

  undoCheckOff(index: number) {
    if (this.localShopping === undefined) {
      this.localShopping = [];
    }
    const ingredient: Ingredient = this.localCheckedOff.splice(index, 1)[0];
    this.addIngredient(ingredient.Name);
    //this.updateCloudShoppingList();
    this.updateCheckedOffList();
  }

  deleteCheckedOffItem(index: number) {
    this.localCheckedOff.splice(index, 1);
    this.updateCheckedOffList();
  }

  doesNameExist(itemName: string): boolean {
    return this.localShopping.find(l => l.Name === itemName) === undefined;
  }

  private deleteItemInShoppingList(index: number) {
    //this.localListOfIngredients.splice(index, 1);
  }



}
