# Giggles Tea Website - Deployment Guide

This guide will walk you through deploying the Giggles Tea website to cPanel with MongoDB Atlas as the database.

## Prerequisites

1. A cPanel hosting account with Node.js support
2. MongoDB Atlas account (free tier available)
3. Domain name (optional but recommended)

## Part 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select the free shared cluster option (M0)
   - Choose a cloud provider and region (select one closest to your users)
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username and password (save these securely)
   - Under "Database User Privileges", select "Atlas admin"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For production, add your cPanel server's IP address
   - For testing, you can temporarily allow access from anywhere (0.0.0.0/0) but restrict this later

5. **Get Your Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string (it will look like `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)

## Part 2: Prepare Your Application

1. **Update Environment Variables**
   - Open `.env.production`
   - Replace the `MONGO_URI` with your MongoDB Atlas connection string
   - Update other variables as needed (JWT_SECRET, email settings, etc.)
   - Make sure to replace all placeholders with your actual values

2. **Build the Frontend**
   ```bash
   npm install
   npm run build
   ```
   This will create a `dist` folder with the production build.

## Part 3: Deploy to cPanel

### Option 1: Using Git (Recommended)

1. **Set Up Git Repository**
   - Initialize a git repository in your project folder:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     ```
   - Create a repository on GitHub/GitLab/Bitbucket
   - Add the remote and push your code

2. **cPanel Setup**
   - Log in to your cPanel
   - Find and open "Setup Node.js App"
   - Click "Create Application"
   - Fill in the details:
     - Node.js version: 16.x or higher
     - Application mode: Production
     - Application root: `your-domain.com` (or subdomain)
     - Application URL: `your-domain.com`
     - Application startup file: `server.js`
   - Click "Create"

3. **Configure Environment**
   - In the Node.js app settings, click on the pencil icon to edit
   - Under "App root", click on the file manager icon
   - Upload your `.env.production` file as `.env`
   - Go back to the Node.js app settings
   - Under "Environment Variables", add all variables from your `.env` file

4. **Deploy from Git**
   - In the Node.js app settings, go to the "Deployment" tab
   - Enter your repository URL
   - Click "Deploy"
   - Wait for the deployment to complete

5. **Install Dependencies and Start**
   - Go to the "App root" in file manager
   - Open the terminal and run:
     ```bash
     npm install --production
     ```
   - Go back to Node.js app settings and click "Reload"

### Option 2: Manual Upload

1. **Compress Your Project**
   - Create a ZIP file of your project (excluding `node_modules` and `.git`)

2. **Upload to cPanel**
   - Log in to cPanel
   - Open "File Manager"
   - Navigate to `public_html` (or your desired directory)
   - Upload the ZIP file
   - Extract it

3. **Set Up Node.js App**
   - Go to "Setup Node.js App"
   - Click "Create Application"
   - Fill in the details (as in Option 1)
   - Set the application root to point to your extracted folder

4. **Install Dependencies**
   - Open the terminal from cPanel
   - Navigate to your application directory
   - Run:
     ```bash
     npm install --production
     ```

## Part 4: Configure Your Domain

1. **Set Up Domain**
   - In cPanel, go to "Domains"
   - Add your domain or subdomain
   - Point your domain's nameservers to your hosting provider if needed

2. **Set Up SSL**
   - In cPanel, go to "SSL/TLS"
   - Install an SSL certificate (Let's Encrypt is free)
   - Force HTTPS by adding this to your `.htaccess`:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteCond %{HTTPS} off
       RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     </IfModule>
     ```

## Part 5: Final Steps

1. **Test Your Application**
   - Visit your domain in a web browser
   - Test all functionality (registration, login, cart, etc.)
   - Check the server logs in cPanel for any errors

2. **Set Up Backups**
   - In cPanel, set up regular backups
   - Consider setting up MongoDB Atlas backups as well

3. **Monitor Performance**
   - Use cPanel's metrics to monitor resource usage
   - Set up monitoring for your MongoDB Atlas cluster

## Troubleshooting

- **Database Connection Issues**:
  - Double-check your MongoDB Atlas connection string
  - Ensure your IP is whitelisted in MongoDB Atlas
  - Check the MongoDB Atlas logs for connection attempts

- **Application Not Starting**:
  - Check the application logs in cPanel
  - Ensure all environment variables are set correctly
  - Verify that the port in your `.env` matches the one in cPanel

- **Static Files Not Loading**:
  - Check file permissions (should be 644 for files, 755 for directories)
  - Ensure the file paths in your code match the deployment structure

## Maintenance

- **Updates**:
  - Regularly update your dependencies (`npm update`)
  - Keep an eye on security updates

- **Backups**:
  - Set up automatic backups for both your application and database
  - Test your backup restoration process

## Need Help?

If you encounter any issues, please refer to:
- cPanel documentation
- MongoDB Atlas documentation
- Node.js documentation

Or contact your hosting provider's support team for assistance.
