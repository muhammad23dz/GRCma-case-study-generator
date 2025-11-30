# Deploying GRCma to Hostinger (Node.js VPS or Cloud)

This guide explains how to deploy your GRCma Next.js application to Hostinger using their Node.js hosting capabilities.

## Prerequisites

- A Hostinger plan that supports **Node.js** (VPS or Cloud Hosting recommended).
- Access to your Hostinger hPanel.

## Step 1: Prepare Your Project

1.  **Entry Point**: We have created a `server.js` file in the root directory. This will serve as the entry point for your application on Hostinger.
2.  **Environment Variables**: You will need your API keys ready.

## Step 2: Upload Files

You can upload your files using **Git** (recommended) or **File Manager/FTP**.

### Option A: Using Git (Recommended)
1.  Push your latest changes to GitHub.
2.  In Hostinger hPanel, go to **Git** and connect your repository.
3.  Deploy the files to your `public_html` (or subfolder).

### Option B: Manual Upload
1.  Zip your project folder **excluding** the following folders:
    *   `node_modules`
    *   `.next`
    *   `.git`
2.  Upload the zip file to your `public_html` folder using File Manager.
3.  Extract the zip file.

## Step 3: Configure Node.js Application in hPanel

1.  Go to **Websites** -> **Manage** -> **Advanced** -> **Node.js**.
2.  **Create Application**:
    *   **Node.js Version**: Select **18** or **20** (Recommended).
    *   **Application Mode**: **Production**.
    *   **Application Root**: The path to your files (e.g., `public_html`).
    *   **Application Startup File**: Enter `server.js`.
3.  Click **Create**.

## Step 4: Install Dependencies & Build

1.  Once the application is created, click **Enter Config** (or use SSH).
2.  **Install Dependencies**:
    *   Run `npm install` in the console/terminal.
3.  **Build the Application**:
    *   Run `npm run build`.
    *   *Note: This step is crucial. It compiles your Next.js app for production.*

## Step 5: Environment Variables

1.  In the Node.js settings in hPanel (or via `.env` file), you must define your environment variables.
2.  Create a `.env` file in your application root (or add these keys in the Environment Variables section if available):

```env
# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# NextAuth Configuration (Required for security)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_a_long_random_string_here
```

*Tip: You can generate a secret by running `openssl rand -base64 32` in a terminal.*

## Step 6: Start the Server

1.  After the build is complete (`npm run build`), go back to the Node.js settings in hPanel.
2.  Click **Restart** (or Start) to launch your application using `server.js`.
3.  Visit your website URL.

## Troubleshooting

-   **500 Error**: Check the **Error Logs** in hPanel.
-   **"Internal Server Error"**: Ensure you ran `npm run build` successfully.
-   **Styles missing**: Ensure `npm run build` completed without errors.
-   **API Errors**: Verify your `DEEPSEEK_API_KEY` is correct in the environment variables.
