import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab3SettingsPage } from './tab3-settings.page';
import { SendInviteModalComponent } from './send-invite-modal/send-invite-modal.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: Tab3SettingsPage }])
  ],
  declarations: [Tab3SettingsPage, SendInviteModalComponent],
  entryComponents: [SendInviteModalComponent]
})
export class Tab3SettingsPageModule {}
