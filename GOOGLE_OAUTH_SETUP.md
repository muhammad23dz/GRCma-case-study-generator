# How to Get Google OAuth Credentials

To enable "Sign in with Google", you need to create a project in the Google Cloud Console. Follow these steps:

## Step 1: Create a Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Sign in with your Google account.
3.  Click the **Select a project** dropdown at the top left.
4.  Click **New Project**.
5.  Name it (e.g., "GRCma App") and click **Create**.

## Step 2: Configure Consent Screen
1.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2.  Select **External** (so any Google user can sign in) and click **Create**.
3.  **App Information**:
    *   **App name**: GRCma (or your app name).
    *   **User support email**: Select your email.
    *   **Developer contact information**: Enter your email.
4.  Click **Save and Continue** (you can skip Scopes and Test Users for now).
5.  Click **Back to Dashboard**.

## Step 3: Create Credentials
1.  In the left sidebar, click **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3.  **Application type**: Select **Web application**.
4.  **Name**: "GRCma Web Client" (or similar).
5.  **Authorized JavaScript origins**:
    *   Add your domain: `https://your-domain.com` (Replace with your actual Hostinger domain).
    *   Add `http://localhost:3000` (if you want to test locally).
6.  **Authorized redirect URIs** (Crucial!):
    *   Add: `https://your-domain.com/api/auth/callback/google`
    *   Add: `http://localhost:3000/api/auth/callback/google`
    *   *Note: Replace `your-domain.com` with your actual website URL.*
7.  Click **Create**.

## Step 4: Copy Your Keys
1.  A popup will appear with your **Client ID** and **Client Secret**.
2.  Copy these strings.
3.  Paste them into your Hostinger Environment Variables (or `.env` file).

```env
GOOGLE_CLIENT_ID=your_copied_client_id
GOOGLE_CLIENT_SECRET=your_copied_client_secret
```

## Important Note on "Publishing"
*   Initially, your app is in "Testing" mode. Only users you add to the "Test users" list can sign in.
*   To let **anyone** sign in, go back to **OAuth consent screen** and click **PUBLISH APP**.
