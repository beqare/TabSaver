# TabSaver - Chrome Extension

A powerful Chrome extension for saving, managing, and restoring your browser tab sessions with ease. Never lose your important browsing sessions again!

## 🚀 Installation

### Method 1: Chrome Web Store
[Download here for Chrome](https://chromewebstore.google.com/detail/mobfpciccpcdilohdmaahldgkdlpmnmm?utm_source=item-share-cb)

### Method 2: Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked** and select the extension directory
5. The extension will be installed and ready to use!

## 🛠 Technical Details

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Edge 88+
- Other Chromium-based browsers

## 📝 Export Format

Sessions are exported in the following JSON structure:
```json
{
  "version": "2.0",
  "exportDate": "2024-01-01T12:00:00.000Z",
  "sessionCount": 5,
  "sessions": [
    {
      "name": "Research Session",
      "tabs": [
        {
          "url": "https://example.com",
          "title": "Example Website"
        }
      ],
      "timestamp": "2024-01-01T10:00:00.000Z",
      "tabCount": 1
    }
  ]
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 🐛 Troubleshooting

### Common Issues
- **Sessions not saving**: Check if you have too many tabs open or storage limits
- **Import not working**: Ensure the file is a valid JSON export from TabSaver
- **Tabs not opening**: Some URLs (chrome://) cannot be restored for security reasons

### Reset Extension
1. Go to `chrome://extensions/`
2. Find TabSaver Pro
3. Click "Remove" and reinstall

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

**Enjoy organized browsing with TabSaver!** 🚀
