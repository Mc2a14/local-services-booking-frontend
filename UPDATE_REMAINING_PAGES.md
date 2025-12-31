# Remaining Pages to Update with Translations

Due to the extensive number of pages, here's a systematic approach:

## Pattern to Follow:

For each page:
1. Add imports: `import { useLanguage } from '../contexts/LanguageContext'` and `import LanguageToggle from '../components/LanguageToggle'`
2. Add hook: `const { t, language } = useLanguage()` in component
3. Replace hardcoded strings with `t('key')`
4. Add `<LanguageToggle />` component near top of page

## Pages Still Needing Updates:
- ProviderProfile.jsx
- AddService.jsx
- EditService.jsx
- ManageServices.jsx
- ManageFAQs.jsx
- Availability.jsx
- Requests.jsx
- ChangeCredentials.jsx
- ForgotPassword.jsx
- ResetPassword.jsx
- BookService.jsx (if still in use)

## Translation Keys Already Added:
All keys are in en.json and es.json files. Use the structure:
- `t('services.title')`
- `t('providerProfile.title')`
- `t('forgotPassword.title')`
- etc.

