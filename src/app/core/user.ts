
interface EmailLists {
    emails: Array<string>;
    isSynced: boolean;
}

export class User {
    isAppsInitialized: boolean;
    userName: string;
    email: string;
    emailVerified: boolean;
    password: string;
    sharedEmails: EmailLists;
    requestedEmails: EmailLists;
    isPremiumUser: boolean;
    premiumCountdown: number;

    UserId: string;
    public stripeCustomerId: string;

    constructor(userName: string, email: string) {
        this.isAppsInitialized = false;
        this.userName = userName;
        this.email = email;
        this.emailVerified = false;
        this.sharedEmails = { emails: [], isSynced:true };
        this.requestedEmails = { emails: [], isSynced:true };
        this.isPremiumUser = false;
        this.premiumCountdown = 5;
    }

    public addToSharedEmails(email: string) {
        this.sharedEmails.emails.push(email);
    }
}