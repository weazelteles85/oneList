
interface EmailLists {
    emails: Array<string>;
    isSynced: boolean;
}

export interface User {
    numberOfRecipes?: number;
    isAppsInitialized: boolean;
    userName: string;
    email: string;
    emailVerified: boolean;
    password?: string;
    sharedEmails: EmailLists;
    requestedEmails: EmailLists;
    incomingRequests: EmailLists;
    isPremiumUser: boolean;
    premiumCountdown: number;
    UserId: string;
    stripeCustomerId: string;
}
