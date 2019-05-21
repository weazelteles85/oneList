import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { User } from '../core/user';
import { HttpClient } from '@angular/common/http';
import { Ingredient } from '../core/ingredient';
import { ToastController } from '@ionic/angular';
import { SendGridService } from './send-grid.service';


@Injectable({
  providedIn: 'root'
})
export class SharingService {

  reqShareURL: string = 'https://us-central1-one-list-e828f.cloudfunctions.net/sendShareRequest';
  updateSharedURL: string = 'https://us-central1-one-list-e828f.cloudfunctions.net/sendUpdateShared';
  cancelSharingURL: string = 'https://us-central1-one-list-e828f.cloudfunctions.net/cancelSharingRequest';
  errorMessage: string = '';
  sendGridErrorMessage: string = '';
  isLoading: boolean = false;

  shoppingListRef: AngularFirestoreDocument<any>;
  //localUser: User;
  localShareRequests: Array<string> = [];

  //incomingRequests: Subject<Array<string>> = new Subject();
  //localIncomingRequests: Array<string> = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private afs: AngularFirestore,
    private toastController: ToastController,
    public sendGrid: SendGridService) {

  }

  async presentToast(messageToDisplay: string, forMiliseconds: number) {
    const toast = await this.toastController.create({
      message: messageToDisplay,
      duration: forMiliseconds,
      position: 'bottom'
    });
    toast.present();
  }

  sendNewShareRequest(emailToShareWith: string, sendEmail: boolean) {
    this.isLoading = true;
    const data = {
      shareWith: emailToShareWith,
      fromEmail: this.authService.localUser.email
    }                                         // Add .pipe(retry(2)).subscribe( to retry this 2 more times
    this.http.post(this.reqShareURL, data, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('successfull response');
        this.isLoading = false;
        //Update User's Requested Sharing unless its already approved to share
        if (this.authService.localUser.sharedEmails.emails.indexOf(emailToShareWith) == -1 &&
          this.authService.localUser.requestedEmails.emails.indexOf(emailToShareWith) == -1) {
          //email not already shared.
          const editedUser = this.authService.localUser;
          editedUser.requestedEmails.emails.push(emailToShareWith);
          editedUser.sharedEmails.isSynced = false;
          this.authService.updateUserData(editedUser);
          this.presentToast('Invitation Sent', 3000);
        }
        if (this.authService.localUser.sharedEmails.emails.indexOf(emailToShareWith) != -1) {
          this.presentToast('Sharing Accepted', 2000);
        }
        if (this.authService.localUser.requestedEmails.emails.indexOf(emailToShareWith) != -1) {
          this.presentToast('Invitation Sent', 3000);
        }
        const emailSubject = 'Lets Share Our Shopping List'
        const htmlBody = `<p>Hey, lets share our shopping list, that way we can keep each other up-to-date on what we need</p>
        <p>simply click <a href="https://onelist.telesapps.com/tabs/(tab3-settings:tab3-settings)">HERE</a></p>
        <p>Or click on your settings tab at <a href="https://onelist.telesapps.com">https://onelist.telesapps.com</a></p>`;
        if (sendEmail) {
          this.sendGrid.sendEmail(emailToShareWith, this.authService.localUser.email, emailSubject, htmlBody, false);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error(error)
        this.errorMessage = error.error;
        if (error.status == 499) {
          const emailSubject = 'Lets Share Our Shopping List'
          const htmlBody = `<p>Hey I'm looking to share my shopping list with you using this new free app called One List, 
          Once you sign up we'll be able to share our grocery list on any device we use.</p>
          <p>Please create an account by clicking <a href="https://onelist.telesapps.com/login">here </a> or got to: 
          <a href="https://onelist.telesapps.com/login">onelist.telesapps.com</a></p>`;
          if (sendEmail) {
            this.sendGrid.sendEmail(emailToShareWith, this.authService.localUser.email, emailSubject, htmlBody, false);
            this.sendGridErrorMessage = this.sendGrid.errorMessage;
            this.errorMessage = 'The user with the email address ' + emailToShareWith +
              ' has not yet created an account with us, we sent them an invitation to join us.' +
              ' Once they do, you will be able to send them another invitation.';
          }
          setTimeout(() => {
            this.errorMessage = "";
          }, 30000);
        }
      },

    );
  }

  // syncShoppingLists(cloudObj, shoppingList: Array<Ingredient>, checkedOffList: Array<Ingredient>) {
  //   console.log('sync list called');
  //   const cloudCheckedOff: Array<Ingredient> = <Array<Ingredient>><unknown>Object.values(cloudObj)[1];
  //   const cloudShoppingList: Array<Ingredient> = <Array<Ingredient>><unknown>Object.values(cloudObj)[3];
  //   const missingFromShopping = cloudShoppingList.filter(ingredient => {
  //     return !shoppingList.find(item => item.Name == ingredient.Name);
  //   })
  //   const missingFromCHeckedOff = cloudCheckedOff.filter(ingrediet => {
  //     return !checkedOffList.find(item => item.Name == ingrediet.Name)
  //   })

  //   const finalShoppingList = shoppingList.concat(missingFromShopping);
  //   const finalCheckedOff = checkedOffList.concat(missingFromCHeckedOff);
  //   return { finalCheckedOff, finalShoppingList };
  // }

  SyncShoppingLists(otherList: Array<Ingredient>, myShoppingList: Array<Ingredient>) {
    let missingFromList: Array<Ingredient>;
    if (otherList !== undefined) {
      missingFromList = otherList.filter(ing => {
        return !myShoppingList.find(item => item.Name === ing.Name);
      });
    }
    const finalList = myShoppingList.concat(missingFromList);
    return finalList;
  }

  updateSharedEmails(shoppingList: Array<Ingredient>, checkedOffList: Array<Ingredient>, isInit: boolean) {

    const list1 = shoppingList.map((obj) => { return Object.assign({}, obj) });
    const list2 = checkedOffList.map((obj) => { return Object.assign({}, obj) });
    //let incomingReqs = this.listOfIncomingRequest;
    const ListObj = {
      isSynced: false,
      isInitialized: isInit,
      ingredientList: list1,
      checkedOffList: list2,
    }

    const emails = this.authService.localUser.sharedEmails.emails;
    emails.forEach(email => {
      const data = {
        shareWith: email,
        listToShare: ListObj
      }
      this.http.post(this.updateSharedURL, data, { responseType: 'text' }).subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
          console.log('there was some problem in updating shared users' + email)
          console.error(error);
        }
      );
    });

  }

  sendRequestToStopSharing(email: string) {
    this.isLoading = true;
    const data = {
      emailToDelete: this.authService.localUser.email,
      userToDeleteFrom: email
    }

    this.http.post(this.cancelSharingURL, data, { responseType: 'text' }).subscribe(
      (response) => {
        console.log(response);
        this.isLoading = false;
        //Update User in Cloud deleting this email.
        this.deleteUserFromShared(email);
        this.presentToast('no longer sharing with ' + email, 4000)
      },
      (error) => {
        console.error('Something Went Wrong');
        this.isLoading = false;
        console.error(error)
        this.errorMessage = error.error;
        setTimeout(() => {
          this.errorMessage = "";
        }, 30000);
      }
    );
  }

  deleteUserFromShared(email: string) {
    const editedUser = this.authService.localUser;
    const index = editedUser.sharedEmails.emails.indexOf(email);
    if (index != -1) {
      editedUser.sharedEmails.emails.splice(index, 1);
    }
    this.authService.updateUserData(editedUser);
  }

  // TestFunction(local: Array<Ingredient>, cloud: Array<Ingredient>) {

  //   const missingFromLocal = cloud.filter(ingredient => {
  //     return !local.find(item => item.Name == ingredient.Name);
  //   })

  //   const newwArray = local.concat(missingFromLocal);
  //   console.log(local);
  //   console.log(missingFromLocal);
  //   console.log(newwArray);
  //   return missingFromLocal

  // }

}
