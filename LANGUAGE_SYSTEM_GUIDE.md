# Language Converter System Documentation

## Overview

The DisasterWatch application now supports **bilingual functionality** with English and Malay (Bahasa Melayu) language options. Users can seamlessly switch between languages throughout the entire application.

## Features

### Frontend Language Support

1. **Complete UI Translation**
   - All pages, components, buttons, labels, and messages are translated
   - Real-time language switching without page reload
   - Language preference stored in browser localStorage
   - Automatic language detection from browser settings

2. **Supported Languages**
   - **English (en)** - Default language
   - **Malay (ms)** - Bahasa Melayu

### Backend Language Support

The backend includes an i18n utility module that provides translation capabilities for API responses and system messages.

## Frontend Implementation

### Translation Files

Translation files are located in `frontend/src/locales/`:

- `en.json` - English translations
- `ms.json` - Malay translations

#### Translation File Structure

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    ...
  },
  "navigation": {
    "home": "Home",
    "chat": "Chat",
    ...
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    ...
  }
  // ... more categories
}
```

### Using Translations in Components

#### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

#### Advanced Usage with Custom Hook

```jsx
import { useT } from '../hooks/useTranslation';

function MyComponent() {
  const { t, common, auth, currentLanguage } = useT();
  
  return (
    <div>
      <h1>{common('welcome')}</h1>
      <button>{auth('login')}</button>
      <p>Current language: {currentLanguage}</p>
    </div>
  );
}
```

### Language Switcher

The language dropdown is available in the header component:

```jsx
<LanguageDropdown
  isOpen={isLanguageDropdownOpen}
  language={currentLanguageDisplay}
  onLanguageChange={handleLanguageChange}
  onToggle={toggleLanguageDropdown}
/>
```

Users can click on the language selector to choose between English and Malay.

### Configuration

The i18n configuration is in `frontend/src/i18n.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ms: { translation: msTranslations },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });
```

## Backend Implementation

### Translation Utility

Location: `backend/utils/i18n.py`

#### Basic Usage

```python
from utils.i18n import translate, Translator

# Simple translation
message = translate('auth.login_success', lang='ms')
# Output: "Log masuk berjaya"

# Using Translator class
translator = Translator(language='ms')
message = translator.t('auth.login_success')
```

#### Creating Translator from Request Headers

```python
from utils.i18n import create_translator

@router.post("/api/endpoint")
async def my_endpoint(request: Request):
    translator = create_translator(request.headers)
    message = translator.t('success.operation_completed')
    return {"message": message}
```

#### Supported Translation Keys

The backend supports the following categories:

- **Authentication**: `auth.*`
- **Reports**: `report.*`
- **Notifications**: `notification.*`
- **Disasters**: `disaster.*`
- **Status**: `status.*`
- **Errors**: `error.*`
- **Success**: `success.*`
- **Chat**: `chat.*`
- **Profile**: `profile.*`
- **Subscription**: `subscription.*`

## Translation Categories

### Common Translations
- Buttons: save, cancel, submit, delete, edit, close
- Actions: search, filter, clear, refresh
- States: loading, error, success

### Navigation
- home, chat, profile, settings, notifications, help, logout
- dashboard, reportDisaster, emergencySupport

### Authentication
- login, register, signin, signup
- email, password, username
- Validation messages
- Success/error messages

### Disaster Management
- reportDisaster, emergencySupport
- disasterType, location, description, severity
- flood, landslide, earthquake, fire, storm
- Status: pending, investigating, resolved

### Notifications
- Types: floodWarning, evacuationNotice, weatherUpdate
- Actions: markAllRead, clearAll
- Settings and preferences

### Chat Interface
- sendMessage, typeMessage, newChat
- chatHistory, exportChat
- Voice controls

## Adding New Translations

### 1. Update Translation Files

Add the new key to both `en.json` and `ms.json`:

**en.json**
```json
{
  "myCategory": {
    "myNewKey": "English text here"
  }
}
```

**ms.json**
```json
{
  "myCategory": {
    "myNewKey": "Teks Melayu di sini"
  }
}
```

### 2. Use in Components

```jsx
const { t } = useTranslation();
<p>{t('myCategory.myNewKey')}</p>
```

### 3. Add to Backend (if needed)

Update `backend/utils/i18n.py`:

```python
TRANSLATIONS = {
    "myCategory.myNewKey": {
        "en": "English text here",
        "ms": "Teks Melayu di sini"
    }
}
```

## Language Detection Order

1. **localStorage** - Saved user preference
2. **Browser navigator** - Browser language settings
3. **HTML tag** - Document language attribute

## Best Practices

### 1. Use Descriptive Keys

❌ Bad:
```json
{ "text1": "Submit" }
```

✅ Good:
```json
{ "auth.submitButton": "Submit" }
```

### 2. Group Related Translations

Group translations by feature or component:
```json
{
  "profile": {
    "title": "My Profile",
    "edit": "Edit Profile",
    "save": "Save Changes"
  }
}
```

### 3. Avoid Hardcoded Text

❌ Bad:
```jsx
<button>Submit Report</button>
```

✅ Good:
```jsx
<button>{t('disaster.submitReport')}</button>
```

### 4. Handle Pluralization

```jsx
// For dynamic content
t('notification.count', { count: notifications.length })
```

### 5. Keep Translations Consistent

Use the same term for the same concept across all translations.

## Testing Language Switching

### Manual Testing

1. Open the application
2. Click the language dropdown in the header
3. Select "Malay" or "English"
4. Verify all text updates correctly
5. Refresh the page - language preference should persist

### Automated Testing

```javascript
// Test language switching
describe('Language Switching', () => {
  it('should switch to Malay', () => {
    i18n.changeLanguage('ms');
    expect(i18n.language).toBe('ms');
    expect(t('common.save')).toBe('Simpan');
  });
});
```

## Troubleshooting

### Problem: Translations not showing

**Solution:**
1. Check if the key exists in both language files
2. Verify the import of `useTranslation`
3. Check browser console for i18n errors

### Problem: Language not persisting

**Solution:**
1. Check localStorage is enabled
2. Verify i18n detector configuration
3. Clear browser cache

### Problem: Some text still in English when Malay is selected

**Solution:**
1. Find the hardcoded text
2. Add translation key to both language files
3. Replace hardcoded text with `t('key')`

## Components with Full Translation Support

### Pages
- ✅ SignIn
- ✅ SignUp
- ✅ Dashboard
- ✅ ReportDisaster
- ✅ EmergencySupport
- ✅ Account
- ✅ Settings
- ✅ NotificationSettings
- ✅ FAQ
- ✅ DisasterDashboard
- ✅ Admin pages

### Components
- ✅ Header
- ✅ Navigation
- ✅ LanguageDropdown
- ✅ ProfileDropdown
- ✅ NotificationDropdown
- ✅ ChatInterface
- ✅ MapView

## API Response Language Support

API responses can be localized by including the `Accept-Language` header:

```javascript
fetch('/api/endpoint', {
  headers: {
    'Accept-Language': 'ms' // or 'en'
  }
});
```

The backend will automatically detect and use the appropriate language for response messages.

## Future Enhancements

1. **Additional Languages**: Support for more languages (Chinese, Tamil, etc.)
2. **RTL Support**: Right-to-left language support
3. **Language-specific Date/Time**: Format dates and times based on language
4. **Translation Management**: Admin interface for managing translations
5. **Crowdsourced Translations**: Community-driven translation improvements

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Language Detection](https://github.com/i18next/i18next-browser-languageDetector)

## Support

For issues or questions about the language system:
1. Check this documentation
2. Review translation files in `frontend/src/locales/`
3. Check the i18n configuration in `frontend/src/i18n.js`
4. Review backend translation utility in `backend/utils/i18n.py`

## Conclusion

The DisasterWatch language converter system provides comprehensive bilingual support across the entire application, ensuring accessibility for both English and Malay-speaking users. The system is designed to be easily extensible for additional languages in the future.
