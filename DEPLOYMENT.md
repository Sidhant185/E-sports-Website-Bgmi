# 🚀 Deployment Guide - Halloween Esports Event

This guide will help you deploy the Halloween Esports Event webpage to Firebase Hosting.

## Prerequisites

- Node.js installed on your system
- Firebase account
- Git (optional, for version control)

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser for authentication. Follow the prompts to complete the login.

## Step 3: Initialize Firebase Project

Navigate to your project directory and initialize Firebase:

```bash
cd "/Users/sidhant/Desktop/VST/Projects and stuff/Projects/Esports"
firebase init
```

Select the following options:
- ✅ **Hosting**: Configure files for Firebase Hosting
- ✅ **Firestore**: Configure security rules and indexes files
- Use an existing project (select your Firebase project)
- Public directory: `.` (current directory)
- Single-page app: `N` (we have multiple pages)
- Overwrite index.html: `N` (we already have our files)

## Step 4: Configure Firebase Project

### Update Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Copy the Firebase configuration object
6. Update `js/firebase-config.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Enable Firebase Services

1. **Firestore Database**:
   - Go to Firestore Database in Firebase Console
   - Click "Create database"
   - Choose "Start in test mode" (we'll update rules later)
   - Select a location close to your users

2. **Authentication**:
   - Go to Authentication in Firebase Console
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Create admin users for the admin panel

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

## Step 5: Add Required Assets

Before deploying, you need to add the following files:

### Video Files (`assets/videos/`)
- `intro.mp4` - 3-5 second intro video (MP4 format)
- `intro.webm` - Same video in WebM format

### Sound Files (`assets/sounds/`)
- `hover.mp3` - Hover sound effect
- `click.mp3` - Click sound effect
- `success.mp3` - Success chime
- `error.mp3` - Error tone
- `next.mp3` - Form progression sound
- `prev.mp3` - Form regression sound
- `glitch.mp3` - Glitch effect sound
- `ghost.mp3` - Ghost trail sound

### Image Files (`assets/images/`)
- `favicon.ico` - Website favicon
- `logo.png` - Event logo (optional)

## Step 6: Test Locally

Test your application locally before deploying:

```bash
firebase serve
```

This will start a local server. Open `http://localhost:5000` to test:
- Main page loads correctly
- Video intro plays (if video files are present)
- Registration form works
- Admin panel is accessible
- Firebase connection is working

## Step 7: Deploy to Firebase Hosting

Deploy your application:

```bash
firebase deploy
```

This will deploy:
- All static files to Firebase Hosting
- Firestore security rules
- Firestore indexes

## Step 8: Configure Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Update DNS records as instructed

## Step 9: Set Up Admin Users

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Create admin accounts with email/password
4. These users can access `/admin.html` to manage tournaments

## Step 10: Test Production Deployment

Visit your deployed site and test:
- ✅ Main page loads
- ✅ Video intro works (if videos are added)
- ✅ Registration form submits to Firestore
- ✅ Admin panel login works
- ✅ Tournament management functions
- ✅ Countdown timer displays correctly
- ✅ Responsive design works on mobile

## Troubleshooting

### Common Issues

1. **Firebase not loading**:
   - Check your Firebase configuration
   - Verify internet connection
   - Check browser console for errors

2. **Video not playing**:
   - Ensure video files are in correct format
   - Check file paths in HTML
   - Test video files in browser directly

3. **Sounds not working**:
   - Check browser autoplay policies
   - Verify sound file paths
   - Test sound files directly

4. **Admin login fails**:
   - Verify Firebase Authentication is enabled
   - Check admin user creation
   - Ensure correct email/password

5. **Registration not saving**:
   - Check Firestore security rules
   - Verify Firestore is enabled
   - Check browser console for errors

### Performance Optimization

1. **Compress images**:
   ```bash
   # Use tools like ImageOptim or online compressors
   ```

2. **Minify CSS/JS** (optional):
   ```bash
   # Use tools like UglifyJS or online minifiers
   ```

3. **Enable Firebase CDN**:
   - Firebase Hosting automatically uses CDN
   - Files are cached globally

## Monitoring and Analytics

### Firebase Analytics (Optional)

1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Add tracking code to your HTML

### Performance Monitoring

1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. Monitor Core Web Vitals

## Backup and Maintenance

### Regular Backups

1. **Firestore Data**:
   - Export data regularly from Firebase Console
   - Use Firebase CLI: `firebase firestore:export`

2. **Code Backup**:
   - Use Git for version control
   - Regular commits and pushes

### Updates and Maintenance

1. **Security Updates**:
   - Keep Firebase CLI updated: `npm update -g firebase-tools`
   - Review Firestore security rules regularly

2. **Content Updates**:
   - Update tournament information in Firebase Console
   - Modify countdown timer dates in `js/countdown.js`

## Support and Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Hosting Guide**: https://firebase.google.com/docs/hosting
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started

## Success Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database enabled
- [ ] Authentication enabled with admin users
- [ ] Security rules deployed
- [ ] All asset files added
- [ ] Local testing completed
- [ ] Production deployment successful
- [ ] Admin panel accessible
- [ ] Registration form working
- [ ] Mobile responsiveness verified

---

**Your Halloween Esports Event is now live! 🎃👻🎮**

Visit your Firebase Hosting URL to see your spooky tournament webpage in action!
