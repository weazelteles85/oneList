import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { SharingService } from 'src/app/services/sharing.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-send-invite-modal',
  templateUrl: './send-invite-modal.component.html',
  styleUrls: ['./send-invite-modal.component.scss']
})
export class SendInviteModalComponent implements OnInit {

  userInput: string;
  sendEmailForm: FormGroup;

  constructor(public authService: AuthService, public sharing: SharingService, public modalController: ModalController) { }

  ngOnInit() {
    this.sendEmailForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onSendRequest(userInput: string) {
    if (userInput != this.authService.localUser.email) {
      console.log(userInput);
      if (this.authService.localUser.sharedEmails.emails === undefined) {
        const returnedValue = this.sharing.sendNewShareRequest(userInput, true);
        returnedValue
      } else if (this.authService.localUser.sharedEmails.emails.indexOf(userInput) === -1) {
        this.sharing.sendNewShareRequest(userInput, true);
      }
      else {
        console.error('You already requested to share with this user');
      }
      this.sendEmailForm.get('email').setValue('');
    }
    else {
      this.sharing.presentToast('You can not share your list with yourself', 5000);
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
