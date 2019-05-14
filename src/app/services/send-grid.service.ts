import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SendGridService {

  public errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private toastController: ToastController, private authService:AuthService) { }

  sendGridURL: string = 'https://us-central1-one-list-e828f.cloudfunctions.net/sendEmail'

  async presentToast(messageToDisplay:string, forMiliseconds:number) {
    const toast = await this.toastController.create({
      message: messageToDisplay,
      duration: forMiliseconds,
      position: 'bottom'
    });
    toast.present();
  }

  sendEmail(ToEmail:string, FromEmail:string, MailSubject:string, HTMLBody:string, isForPremium:boolean) {
    this.isLoading = true;
    console.log('sendEmail called');

    const data = {
      toEmail: ToEmail,
      fromEmail: FromEmail,
      eMailSubject: MailSubject,
      htmlBody: HTMLBody,
    }

    this.http.post(this.sendGridURL, data, { responseType: 'text' }).subscribe(
      (res) => {
        this.isLoading = false;
        console.log(res);
        this.presentToast('invitation sent to ' + ToEmail, 5000);
        if(isForPremium) {
          const editedUser = this.authService.localUser;
          editedUser.premiumCountdown--;
          this.authService.updateUserData(editedUser);
        }
      },
      (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = err;
        this.presentToast('Something Went Wrong ' + err.error, 5000);
      }
    );
  }
}
