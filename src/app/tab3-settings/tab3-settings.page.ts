import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../core/user';
import { AuthService } from '../services/auth.service';
import { DataStorageService } from '../services/data-storage.service';
import { SharingService } from '../services/sharing.service';
import { ModalController } from '@ionic/angular';
import { SendInviteModalComponent } from './send-invite-modal/send-invite-modal.component'
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3-settings',
  templateUrl: 'tab3-settings.page.html',
  styleUrls: ['tab3-settings.page.scss']
})
export class Tab3SettingsPage {

  //localListOfRequests: Array<string>;
  localListOfEmails: Array<string>;

  constructor(public sharing: SharingService,
    public dataStorage: DataStorageService,
    public authService: AuthService,
    public modalController: ModalController,
    private router: Router) {
    //this.authService.USER.subscribe(user => this.localListOfEmails = Object.values(user.sharedEmails.emails));
    this.localListOfEmails = this.authService.localUser.sharedEmails.emails;
  }

  onAcceptOffer(email: string, index: number) {
    this.dataStorage.onShareShoppingListAccepted(email, index);

    const editedUser: User = this.authService.localUser;
    editedUser.sharedEmails.emails.push(email);
    editedUser.sharedEmails.isSynced = false; // <-- informs that this users lists need to be synced.
    this.authService.updateUserData(editedUser); //<--Updates User On Server with new shared email data
    this.dataStorage.deleteIncomingRequest(index); // <-- Deleted Incoming requests and updates cloud
    this.sharing.sendNewShareRequest(email, false); // <-- Sends a new function to the original caller requesting invite
    //this.dataStorage.updatePendingRequests();
  }

  onDeclineOffer(email: string, index: number) {
    this.dataStorage.deleteIncomingRequest(index);
  }

  async onOpenShareModal() {
    // Create a modal using MyModalComponent with some initial data
    if (this.authService.localUser.sharedEmails.emails.length < 1 || this.authService.localUser.isPremiumUser) {
      const modal = await this.modalController.create({
        component: SendInviteModalComponent
      });
      return await modal.present();
    }
    else {
      this.sharing.presentToast('You can only share your shopping list with one person at a time, ' + 
      'try One List Premium to share with as many people as you want', 8000);
      this.router.navigate(['/payment']);
    }
  }

  onStopSharing(index: number) {
    const emailToDelete: string = this.localListOfEmails[index];
    this.sharing.sendRequestToStopSharing(emailToDelete);
  }

  onLogOut() {
    this.router.navigate(['/login']);
    this.authService.logOut();
  }

  navigateToPayment() {
    try {
      this.router.navigate(['/payment']); 
    } catch (error) {
      this.sharing.presentToast('Error: ' + error, 10000);
    }
  }

}
