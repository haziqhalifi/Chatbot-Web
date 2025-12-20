# Language Converter Quick Start Guide

## For Users

### How to Change Language

1. **Locate the Language Selector**

   - Look at the top-right corner of the application
   - You'll see either "English" or "Malay" displayed

2. **Click the Language Selector**

   - A dropdown menu will appear with two options:
     - 🇺🇸 English
     - 🇲🇾 Malay

3. **Select Your Preferred Language**

   - Click on your desired language
   - The entire application will instantly switch to that language

4. **Language Preference Persists**
   - Your choice is automatically saved
   - The application will remember your preference even after closing your browser

## For Developers

### Quick Setup

#### 1. Install Dependencies

Already installed in the project:

- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Automatic language detection

#### 2. Import and Use Translations

```jsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <button>{t("common.save")}</button>;
}
```

#### 3. Available Translation Keys

##### Common Actions

```jsx
t("common.loading"); // Loading... / Memuatkan...
t("common.save"); // Save / Simpan
t("common.cancel"); // Cancel / Batal
t("common.submit"); // Submit / Hantar
t("common.delete"); // Delete / Padam
t("common.close"); // Close / Tutup
```

##### Authentication

```jsx
t("auth.login"); // Login / Log Masuk
t("auth.register"); // Register / Daftar
t("auth.email"); // Email / Emel
t("auth.password"); // Password / Kata Laluan
```

##### Navigation

```jsx
t("navigation.home"); // Home / Laman Utama
t("navigation.chat"); // Chat / Sembang
t("navigation.profile"); // My Account / Akaun Saya
t("navigation.settings"); // Settings / Tetapan
t("navigation.notifications"); // Notification Settings / Tetapan Notifikasi
```

##### Disaster Management

```jsx
t("disaster.reportDisaster"); // Report Disaster / Lapor Bencana
t("disaster.flood"); // Flood / Banjir
t("disaster.landslide"); // Landslide / Tanah Runtuh
t("disaster.earthquake"); // Earthquake / Gempa Bumi
t("disaster.location"); // Location / Lokasi
t("disaster.description"); // Description / Penerangan
```

### Adding a New Translation

**Step 1:** Add to `frontend/src/locales/en.json`

```json
{
  "myFeature": {
    "title": "My New Feature"
  }
}
```

**Step 2:** Add to `frontend/src/locales/ms.json`

```json
{
  "myFeature": {
    "title": "Ciri Baharu Saya"
  }
}
```

**Step 3:** Use in your component

```jsx
<h1>{t("myFeature.title")}</h1>
```

### Backend Translation Example

```python
from utils.i18n import translate, create_translator

# Method 1: Direct translation
message = translate('auth.login_success', lang='ms')

# Method 2: Using translator instance
@router.post("/api/login")
async def login(request: Request):
    translator = create_translator(request.headers)
    return {
        "message": translator.t('auth.login_success')
    }
```

## Translation Coverage

### ✅ Fully Translated Pages

- Sign In / Log Masuk
- Sign Up / Daftar
- Dashboard / Papan Pemuka
- Report Disaster / Lapor Bencana
- Emergency Support / Sokongan Kecemasan
- My Account / Akaun Saya
- Settings / Tetapan
- Notifications / Pemberitahuan
- Help & FAQ / Bantuan & Soalan Lazim
- Admin Pages / Halaman Admin

### ✅ Fully Translated Components

- Header / Pengepala
- Navigation / Navigasi
- Language Dropdown / Dropdown Bahasa
- Profile Dropdown / Dropdown Profil
- Notification Dropdown / Dropdown Notifikasi
- Chat Interface / Antara Muka Sembang
- Map Components / Komponen Peta

## Common Translation Patterns

### 1. Button Labels

```jsx
// English: Save Changes
// Malay: Simpan Perubahan
<button>
  {t("common.save")} {t("common.changes")}
</button>
```

### 2. Form Labels

```jsx
// English: Email Address
// Malay: Alamat Emel
<label>{t("auth.emailAddress")}</label>
```

### 3. Error Messages

```jsx
// English: Please fill in all required fields.
// Malay: Sila isi semua medan yang diperlukan.
<div className="error">{t("errors.validationError")}</div>
```

### 4. Success Messages

```jsx
// English: Report submitted successfully
// Malay: Laporan berjaya dihantar
<div className="success">{t("disaster.reportSuccess")}</div>
```

## Language Files Location

```
frontend/
  src/
    locales/
      en.json  ← English translations
      ms.json  ← Malay translations
    i18n.js    ← i18n configuration

backend/
  utils/
    i18n.py    ← Backend translation utility
```

## Testing Translations

### Browser Testing

1. Open application
2. Switch language
3. Navigate through different pages
4. Verify all text changes
5. Check forms, buttons, and messages

### Code Testing

```javascript
import { t } from "i18next";

describe("Translations", () => {
  it("should translate to Malay", () => {
    i18n.changeLanguage("ms");
    expect(t("common.save")).toBe("Simpan");
  });
});
```

## Tips for Quality Translations

1. **Keep it Natural**: Translate meaning, not just words
2. **Be Consistent**: Use the same term for the same concept
3. **Consider Context**: Some words have different meanings in different contexts
4. **Test with Native Speakers**: Get feedback from Malay speakers
5. **Keep Translations Short**: UI space is limited

## Getting Help

### Translation Issues?

- Check if the key exists in both `en.json` and `ms.json`
- Verify the key path is correct
- Check browser console for errors

### Need to Add More Languages?

1. Create new language file (e.g., `zh.json` for Chinese)
2. Update `i18n.js` configuration
3. Add language option to dropdown
4. Translate all keys

### Backend Translation Not Working?

- Check `Accept-Language` header is being sent
- Verify translation key exists in `backend/utils/i18n.py`
- Check server logs for errors

## Quick Reference Card

| English           | Malay              | Key                         |
| ----------------- | ------------------ | --------------------------- |
| Loading...        | Memuatkan...       | `common.loading`            |
| Save              | Simpan             | `common.save`               |
| Cancel            | Batal              | `common.cancel`             |
| Submit            | Hantar             | `common.submit`             |
| Login             | Log Masuk          | `auth.login`                |
| Register          | Daftar             | `auth.register`             |
| Report Disaster   | Lapor Bencana      | `disaster.reportDisaster`   |
| Emergency Support | Sokongan Kecemasan | `disaster.emergencySupport` |
| My Account        | Akaun Saya         | `navigation.profile`        |
| Settings          | Tetapan            | `navigation.settings`       |
| Logout            | Log Keluar         | `navigation.logout`         |

## Summary

The DisasterWatch language system is fully implemented and ready to use. Users can switch between English and Malay seamlessly, and developers can easily add new translations or extend support to additional languages.

**Key Features:**

- ✅ Instant language switching
- ✅ Persistent language preference
- ✅ Comprehensive translation coverage
- ✅ Backend API translation support
- ✅ Easy to extend and maintain

For detailed documentation, see `LANGUAGE_SYSTEM_GUIDE.md`.
