# Security Specification for Ads & Ad Requests

This document outlines the security architecture and invariants for the dynamic app advertising and client order request platform.

## 1. Data Invariants

1. **Public Readability for Ads**: Any guest user can fetch and display active advertisements.
2. **Restricted Modification for Ads**: Only authorized administrators (located in the `/admins` collection) can create, modify, or delete ads.
3. **Public Submission for Ad Requests**: Anyone (authenticated or guest) can submit an ad campaign placement request.
4. **No Spam / Denial of Wallet**: Ad requests must follow strict size limitations. No fields can exceed safe character lengths, preventing network/memory attacks.
5. **No Reading of Requests by Others**: Submissions are "write-only" for public clients. Only authorized administrators (located in the `/admins` collection) can list or read the submitted ad requests.

## 2. The "Dirty Dozen" Malicious Payloads

The security rules must block the following types of malicious writes:

1. **Unauthenticated Ad Hijacking**: A public user attempts to overwrite the active advertisement.
2. **Mass Ad Deletion**: A generic user attempts to write or delete random ads in `/ads/{adId}`.
3. **Admin Privileges Escalation**: A user attempts to add their own UID into `/admins/{userId}`.
4. **Ad Request Snooping**: A public user attempts to read other clients' submitted ad requests from `/adRequests/{requestId}`.
5. **Ad Request Injection Spam**: A submission containing a payload with thousands of keys or oversized data blobs.
6. **Oversized String Injection in Ads**: Writing 10 Megabyte values for titles or description texts.
7. **Ad Request State Spoofing**: Attempting to alter structural tracking fields after creation.
8. **Malicious ID Poisoning**: Trying to write an ad request with an key containing invalid special characters or incredibly long invalid strings, e.g., `/adRequests/!!!-super-junk-!!!`.
9. **Timestamp Counterfeiting**: Sending a custom spoofed date instead of letting the server bind `request.time`.
10. **Shadow Key Attacks**: Injecting additional non-schema fields into the payload to compromise JSON parsing.
11. **Ad Request Deletion**: Clients trying to clean up, modify, or delete their submissions after publishing.
12. **Foreign Reference Orphan Writes**: Trying to write to parent nodes that do not check valid associations.

---

## 3. Fortress Access Rules (DRAFT)

We enforce these checks in the `DRAFT_firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
