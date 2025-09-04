# 🌟 Aura Browser

متصفح ويب متقدم مبني بـ React Native + Expo مع تركيز على الخصوصية والأداء.

## ✨ الميزات الرئيسية

- 🚀 **أداء عالي**: مبني على Hermes Engine
- 🔒 **خصوصية متقدمة**: Ad blocking، Incognito mode، Night mode
- 📱 **تصميم متجاوب**: يعمل على جميع أحجام الشاشات
- 🌍 **دعم متعدد اللغات**: العربية والإنجليزية مع RTL
- 📚 **إدارة متقدمة**: تبويبات، مفضلة، تاريخ، تحميلات
- ⚡ **تزامن سحابي**: مزامنة البيانات عبر الأجهزة

## 🏗️ البنية التقنية

### Frontend (Mobile)
- **React Native** 0.79.1
- **Expo** 53.0.0
- **TypeScript** (Strict mode)
- **Zustand** (State management)
- **TanStack Query** (Data fetching)
- **NativeWind** (Styling)
- **i18next** (Internationalization)

### Backend
- **NestJS** (Node.js framework)
- **Prisma** (Database ORM)
- **PostgreSQL** (Database)
- **JWT** (Authentication)
- **OpenAPI** (API documentation)

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 18+
- npm أو yarn
- Expo CLI
- Android Studio (للأندرويد)
- Xcode (للـ iOS)

### خطوات التشغيل

1. **تثبيت التبعيات:**
```bash
npm install
```

2. **تشغيل التطبيق:**
```bash
# تشغيل على جميع المنصات
npm run dev

# تشغيل على أندرويد فقط
npm run android

# تشغيل على iOS فقط
npm run ios

# تشغيل على الويب
npm run web
```

3. **تشغيل الاختبارات:**
```bash
# اختبارات الوحدة
npm test

# اختبارات مع مراقبة التغييرات
npm run test:watch

# تقرير التغطية
npm run test:coverage

# اختبارات طرفية
npm run test:e2e
```

4. **فحص الجودة:**
```bash
# فحص TypeScript
npm run typecheck

# فحص ESLint
npm run lint

# إصلاح ESLint تلقائياً
npm run lint:fix

# فحص تنسيق Prettier
npm run format:check

# تطبيق تنسيق Prettier
npm run format
```

## 📁 هيكل المشروع

```
aura-browser/
├── app/                    # Expo Router pages
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── browser/       # Browser core functionality
│   │   ├── tabs/          # Tabs management
│   │   ├── bookmarks/     # Bookmarks management
│   │   ├── history/       # History management
│   │   ├── settings/      # Settings & preferences
│   │   └── downloads/     # Downloads management
│   └── shared/            # Shared utilities
│       ├── api/           # API client & services
│       ├── lib/           # Utility functions
│       ├── store/         # Global state management
│       ├── types/         # TypeScript definitions
│       ├── ui/            # Reusable UI components
│       └── styles/        # Global styles
├── assets/                # Static assets
├── docs/                  # Documentation
└── tests/                 # Test configurations
```

## 🧪 الاختبارات

- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: Supertest (Backend)
- **E2E Tests**: Detox
- **Coverage Target**: 80%+

## 🔧 التطوير

### Git Workflow
- استخدم Conventional Commits
- Pre-commit hooks للـ linting والتنسيق
- Commit message validation

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Husky + lint-staged
- Test coverage monitoring

## 📱 البناء والنشر

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

### Web
```bash
npm run build:web
```

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء feature branch
3. Commit التغييرات
4. Push للـ branch
5. إنشاء Pull Request

## 📄 الترخيص

MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم

- 📧 Email: support@aura-browser.com
- 🐛 Issues: [GitHub Issues](https://github.com/aura-browser/issues)
- 📖 Docs: [Documentation](https://docs.aura-browser.com)