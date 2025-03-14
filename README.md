# 🌐 LIVE SITE: [BLINKTEXT](https://blink-text.netlify.app/) 🌐

> 🔒 End-to-End Encrypted Secure Text Sharing with Markdown Support

# Blink Text - Secure Text Sharing

A modern, secure, and user-friendly application for sharing sensitive text with end-to-end encryption and markdown support.

## Features

### Security

- 🔒 **End-to-End Encryption**: All text is encrypted using AES-256 before transmission and only decrypted when viewed
- 🔑 **Password Protection**: Optional password protection for sensitive content
- ⏰ **Auto-Expiration**: Set custom expiration times (5min, 1hour, 1day, 1week, or custom)
- 👁️ **View Limits**: Control how many times your text can be viewed
- 🚫 **View Once**: Option to delete text after first view
- 🔐 **Secure Storage**: Encrypted storage with automatic cleanup

### User Experience

- 🎨 **Modern UI**: Clean and intuitive interface
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast Performance**: Optimized for speed and reliability
- 📝 **Markdown Support**: Format your text with full markdown support including:
  - Headers, lists, and tables
  - Code blocks with syntax highlighting
  - Links and images
  - Bold, italic, and strikethrough text
  - Blockquotes and horizontal rules
- 🌐 **Language Detection**: Automatic code language detection
- 📋 **Copy to Clipboard**: Easy sharing with one click

### Additional Features

- 🔄 **Real-time Updates**: View count and status updates
- 📊 **Dashboard**: Track and manage your shared texts
- 🔍 **Search & Filter**: Find your texts easily
- 📈 **Analytics**: View usage statistics
- 🌙 **Dark Mode**: Comfortable viewing in any lighting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:

   ```bash
git clone https://github.com/kalp9197/blink-text.git
cd blink-text
   ```

2. Install all dependencies (client and server):

   ```bash
npm run install-all
```

This will install:

- Root project dependencies
- Client dependencies
- Server dependencies

3. Set up environment variables:

   ```bash
# In the server directory, create a .env file:
cp server/.env.example server/.env
# Edit server/.env with your configuration
   ```

4. Start the development servers:

   ```bash
# Start both client and server
npm start

# Or start them separately:
npm run client  # Starts client on http://localhost:3000
npm run server  # Starts server on http://localhost:5001
```

## Usage

1. Visit the homepage
2. Enter your text
3. Configure security options:
   - Set expiration time
   - Add password protection
   - Set view limits
   - Enable view-once mode
4. Click "Create Secure Text"
5. Share the generated link with your recipient

## Security Features

### End-to-End Encryption

- Text is encrypted using AES-256 before transmission
- Encryption key is generated uniquely for each text
- Decryption only happens client-side when viewing
- Server never sees the unencrypted content

### Password Protection

- Passwords are hashed using SHA-256
- Secure password verification
- Brute force protection

### Data Protection

- Automatic text deletion after expiration
- View count tracking
- Rate limiting
- CORS protection
- XSS prevention

## Development

### Project Structure

```
blink-text/
├── client/             # React frontend
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── server/            # Node.js backend
│   ├── src/          # Source files
│   └── package.json  # Backend dependencies
└── package.json      # Root project configuration
```

### Available Scripts

- `npm start`: Run both client and server in development mode
- `npm run client`: Run only the client
- `npm run server`: Run only the server
- `npm run install-all`: Install all dependencies
- `npm run build`: Build the client for production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Icons from Feather Icons
- Syntax highlighting with Prism.js
- Markdown support with React Markdown

## Author

- GitHub: [@kalp9197](https://github.com/kalp9197)
