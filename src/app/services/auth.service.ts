import { auth } from 'firebase';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, from } from 'rxjs';
import { switchMap, take, } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { User } from '../core/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  localUser: User;
  USER: Observable<User>;
  emailSent = false;
  errorMessage: string;

  provider: any = new auth.GoogleAuthProvider();

  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router) {
    // Get auth data, then get firestore user document || null
    this.USER = this.afAuth.authState.pipe(switchMap(user => {
      if (user) {
        return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
      } else {
        return of(null)
      }
    }));
    this.USER.subscribe((user) => {
      if (user) {
        if (user.premiumCountdown === 0) {
          const editedUser = user;
          editedUser.premiumCountdown--;
          editedUser.isPremiumUser = true;
          this.updateUserData(editedUser);
          return;
        }
      }
      this.localUser = user
    });
  }

  getUser() {
    return this.USER;
  }

  // Login/Signup
  // Register New User
  registerNewUser(email: string, password: string) {
    const user: User = new User('unknown', email);
    console.log(user);
    this.afAuth.auth.createUserWithEmailAndPassword(user.email, password).catch(
      error => console.error(error)
    ).then(
      (response) => {
        const authUser = this.afAuth.auth.currentUser;
        user.UserId = authUser.uid;
        this.updateUserData(user);
        authUser.sendEmailVerification().then(
          (value) => {
            console.log('Email sent to user');
            this.emailSent = true;
            if (this.afAuth.auth.currentUser.emailVerified) { this.emailSent = false; }
            else {
              this.afAuth.auth.signOut();
            }
          }
        ).catch(
          (error) => {
            console.error(error);
          }
        );
      }
    )
  }

  signinWithEmailAndPassword(email: string, password: string) {
    this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
      (credential) => {
        if (this.afAuth.auth.currentUser.emailVerified) {
          console.log('inside Login with email and password');
          this.router.navigate(['/']);
        }
        else {
          this.errorMessage = "Please verify your email, you should have received a link";
          this.logOut();
        }
      }
    ).catch((error) => {
      this.errorMessage = error;
      console.error(error);
    });
  }

  // Sign in with Google
  signInWithGoogle() {
    console.log('login with google called')
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.USER.subscribe((user) => {
          if (!user) {
            const userData: User = new User(
              this.afAuth.auth.currentUser.displayName,
              this.afAuth.auth.currentUser.email)
            userData.UserId = this.afAuth.auth.currentUser.uid;
            userData.emailVerified = true;
            return this.updateUserData(userData);
          }
          else {
            this.router.navigate(['/'])
            return this.afs.doc(`users/${credential.user.uid}`);
          }
        });
      })
  }

  public updateUserData(userData: User) {
    // Sets user data to firestore on Login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${userData.UserId}`);
    console.log('updateUserDataCalled');
    return userRef.set(JSON.parse(JSON.stringify(userData)), { merge: true });
  }

  logOut() {
    this.afAuth.auth.signOut()
  }

  isLoggedIn() {

    console.log(this.localUser)
  }

  // Used by the http interceptor to set the auth header
  getUserIdToken(): Observable<string> {
    if (this.afAuth.auth.currentUser) {
      return from(this.afAuth.auth.currentUser.getIdToken());
    }
    else return null;
  }


}
