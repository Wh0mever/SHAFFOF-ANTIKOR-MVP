<div align="center">

# 🛡️ SHAFFOF AI

### *Real-time AI-watchdog для государственных закупок Узбекистана*

**«Прозрачность» по-узбекски. Каждый подозрительный тендер — у вас на виду через 5 минут после публикации.**

---

[![Live Demo](https://img.shields.io/badge/Live-shaffof--antikor--mvp.up.railway.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://shaffof-antikor-mvp-production.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Wh0mever%2FSHAFFOF--ANTIKOR--MVP-181717?style=for-the-badge&logo=github)](https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[**🚀 Открыть демо**](https://shaffof-antikor-mvp-production.up.railway.app) · [**📊 Дашборд**](https://shaffof-antikor-mvp-production.up.railway.app/) · [**🗺 Карта рисков**](https://shaffof-antikor-mvp-production.up.railway.app/map) · [**🤖 AI Анализ**](#-ai-аналитика-3-уровня)

</div>

---

## 🎯 Контекст хакатона

Хакатон **«Антикоррупция через технологии»** · Узбекистан · 2026

**Государственные закупки Узбекистана** — это:
- 💰 **50+ триллионов сум** ежегодного оборота через `xarid.uzex.uz`
- 📑 **Десятки тысяч тендеров** в год
- 👁️ **Ноль публичных real-time инструментов** анализа на коррупционные риски
- 📰 Журналисты-расследователи и активисты вынуждены **проверять вручную**

**Что мы сделали за хакатон:** автономный AI-аналитик, который мониторит тендеры 24/7, ловит коррупционные паттерны по 6 правилам, объясняет каждую аномалию через 3 разных LLM (GPT-4o-mini → Perplexity → Claude Sonnet 4.5), и публикует критические алерты в Telegram-канал в реальном времени.

---

## 👥 Команда WHOMEVER

<table>
  <tr>
    <td align="center" width="50%">
      <h3>🚀 NURITDINOV SHOXRUX</h3>
      <b>Team Lead · Full-Stack · AI Engineer</b>
      <br/><br/>
      <code>CEO @ WHOMEVER</code><br/>
      <code>Resident of IT PARK Uzbekistan</code><br/>
      <code>Master's degree, TDIUSF</code><br/>
      <br/>
      <i>Архитектура · AI-конвейер · Frontend · Бизнес-логика</i>
    </td>
    <td align="center" width="50%">
      <h3>⚙️ SANJAR IBRAGIMOV</h3>
      <b>DevOps Engineer</b>
      <br/><br/>
      <code>Infrastructure · CI/CD</code><br/>
      <code>Railway deployment</code><br/>
      <code>Postgres administration</code><br/>
      <br/>
      <i>Деплой · Мониторинг · Инфраструктурная безопасность</i>
    </td>
  </tr>
</table>

---

## ⚡ Что умеет SHAFFOF AI

### 1️⃣ Детекция коррупционных аномалий (6 правил)

| Код | Аномалия | Severity | Описание |
|-----|----------|:--------:|----------|
| `SOLO` | Единственный участник | ~70 | Тендер с 1 участником — нет конкуренции |
| `PRICE_SPIKE` | Завышенная цена | ~75 | Сумма в 2+ раза выше медианы по категории |
| `SERIAL` | Серийный победитель | ~80 | Один поставщик многократно побеждает у заказчика |
| `RUSHED` | Срочная закупка | ~55 | Срок подачи заявок ≤ 5 дней |
| `ROUND` | Круглая сумма | ~60 | Подозрительно круглая сумма (кратна 100 млн) |
| `REGION` | Региональная монополизация | ~65 | Один поставщик берёт > 50% контрактов в регионе |

Каждый алерт получает агрегированный **Corruption Risk Score 0-100** с учётом всех сработавших правил.

### 2️⃣ AI-аналитика 3 уровня

```
Тендер → Detection Engine → Risk Score → AI Pipeline → UI / Telegram
```

| Уровень | Модель | Провайдер | Когда | Что выдаёт |
|:------:|--------|-----------|-------|------------|
| **L1** | `gpt-4o-mini` | OpenAI | **Автоматически** при открытии | Быстрое объяснение в 2-3 предложениях, **streaming** |
| **L2** | `sonar-pro` | Perplexity | По запросу `[Чуқур таҳлил]` | Глубокий research с поиском по открытым источникам |
| **L3** | `claude-sonnet-4-5` | Anthropic | По запросу `[Журналистский отчёт]` | Полный markdown-отчёт со структурой |

**Особенности AI-конвейера:**
- 🔥 **Streaming** в реальном времени (видно как Claude печатает букву за буквой)
- 💾 **Кэширование** в Postgres — повторное открытие тендера = мгновенный ответ
- 🛡️ **Local fallback** — если все API-ключи недоступны, система всё равно генерирует осмысленные объяснения по детерминистским шаблонам
- 🌐 **Multi-provider** — каскадный fallback OpenAI → Gemini, Perplexity → шаблон, Claude → шаблон

### 3️⃣ Real-time Telegram интеграция

- 🔔 **Канал критических алертов** — все события с severity ≥ 80 автоматически публикуются
- 🤖 **Бот с командами** для персональных подписок:
  ```
  /start              — приветствие и помощь
  /subscribe          — подписаться на все критические
  /subscribe region Toshkent  — только по Ташкенту
  /subscribe min 60   — только severity ≥ 60
  /list               — текущие подписки
  /stop               — отписаться
  ```
- 🔐 Webhook с подписью `X-Telegram-Bot-Api-Secret-Token` для защиты от спуфинга

### 4️⃣ Watchlist с браузерными уведомлениями

- ⭐ **Звёздочка** в каждой карточке — следить за тендером, заказчиком, поставщиком или регионом
- 📋 Отдельная страница `/watchlist` со сгруппированным списком наблюдений
- 🔔 **Native Browser Notifications** — всплывающее уведомление в системном трее когда сработает новая аномалия по watch-объекту
- 💾 Полностью клиентская реализация (localStorage) — приватность и нулевой backend overhead

### 5️⃣ 2D-карта рисков Узбекистана

- 🗺 **14 регионов** в реальной геометрии (simplemaps SVG)
- 🌡 **Тепловая карта** — заливка по уровню риска: критический / высокий / средний / низкий / нет данных
- 💥 **Пульсирующие критические регионы** — drop-shadow анимация для зон с severity ≥ 60
- 📍 **Боковая панель** — score, кол-во тендеров, общая сумма «под риском», полный список тендеров с переходом в детальный модал
- 🎯 Клик по региону на карте или в списке → синхронная подсветка

### 6️⃣ Граф связей «заказчик ↔ поставщик»

- 🕸 **Bipartite SVG-граф** — топ-8 заказчиков слева, топ-8 поставщиков справа
- 📏 **Толщина ребра** = количество совместных тендеров
- 🎨 **Цвет ребра** = максимальный severity по этой паре
- ✨ **Hover** — подсветка узла и всех его связей, остальное приглушается
- 👆 **Клик по ребру** → детальный модал пары с полным списком общих тендеров

### 7️⃣ AI-чат с контекстом

- 💬 Floating чат-виджет (правый нижний угол)
- 🎯 **Подсказки зависят от текущей страницы**:
  - На `/alerts` → «Что такое SOLO?»
  - На `/map` → «Какой регион самый проблемный?»
  - На `/connections` → «Кто чаще побеждает у одного заказчика?»
- 📚 **История** в localStorage (последние 30 сообщений)
- 🔥 **Streaming ответов** — посимвольно с курсором
- 🛡 Подкладывает реальную статистику из БД в системный промт
- 📴 Если AI недоступен — отвечает локально на основе шаблонов и данных

### 8️⃣ Журналистский PDF-досье

- 📄 Кнопка **PDF Dossier** в детальном модалке
- 🖨 Print-ready HTML с всеми 3 уровнями AI-анализа
- 🏷 Фирменное оформление SHAFFOF + полные мета-данные тендера
- 📤 Готов к публикации в СМИ или передаче следственным органам

### 9️⃣ Public REST API

| Метод | Эндпоинт | Назначение |
|:-----:|----------|------------|
| `GET` | `/api/v1/alerts` | Список алертов с фильтрами `?region=&min_severity=&rule=` |
| `GET` | `/api/v1/alerts/:id` | Детали алерта + AI-анализы |
| `GET` | `/api/v1/organ/:tin` | Карточка заказчика по ИНН |
| `GET` | `/api/v1/stats` | Сводная статистика (totalAlerts, byRegion, byRule, ...) |

CORS открыт для `*` — журналисты и независимые аналитики могут строить свои дашборды.

### 🔟 LIVE / DEMO режимы

- ⚡ **LIVE** — реальные данные из БД через cron-сборщик с UZEX
- 🎮 **DEMO** — 50 детерминистских синтетических алертов (для презентаций, скриншотов, UI-разработки без БД)
- Переключение в один клик в TopBar
- Сохранение режима в `localStorage` + cookie — переживает навигацию и перезагрузку

---

## 🏗 Архитектура

```
                  ┌─────────────────────────────┐
                  │   xarid.uzex.uz (UZEX API)  │
                  └──────────────┬──────────────┘
                                 │ POST every 5min
                                 ▼
                  ┌─────────────────────────────┐
                  │  /api/cron/poll  (Railway)  │
                  │  CRON_SECRET-protected      │
                  └──────────────┬──────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
      ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
      │  Detection    │  │  AI Pipeline  │  │   Telegram    │
      │  Engine       │  │  (3 levels)   │  │  Broadcaster  │
      │               │  │               │  │               │
      │  6 правил →   │  │  GPT-4o-mini  │  │  Channel +    │
      │  Risk Score   │  │  Perplexity   │  │  Subscribers  │
      │  0-100        │  │  Claude 4.5   │  │  по фильтрам  │
      └───────┬───────┘  └───────┬───────┘  └───────────────┘
              │                  │
              └────────┬─────────┘
                       ▼
            ┌─────────────────────┐
            │   PostgreSQL        │
            │   (Tender, Alert,   │
            │    BuyerStats,      │
            │    TgSubscription)  │
            └──────────┬──────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
    ┌─────────────────┐  ┌─────────────────┐
    │  Public REST    │  │  Next.js UI     │
    │  /api/v1/*      │  │  (Dashboard,    │
    │  CORS: *        │  │   Map, Alerts,  │
    │                 │  │   Watchlist,    │
    │  для прессы и   │  │   Connections,  │
    │  аналитиков     │  │   AI Chat)      │
    └─────────────────┘  └─────────────────┘
```

---

## 🛠 Технологический стек

### Frontend
- **Next.js 14.2.35** (App Router, React Server Components)
- **React 18.3** + **TypeScript** (strict mode)
- **Tailwind CSS 3** + ручные shadcn-style примитивы
- **Recharts** для графиков (донат, ареа-чарт, бары)
- **Lucide-React** для иконок
- **Custom 2D SVG карта** Узбекистана (simplemaps)

### Backend
- **Next.js API Routes** (Node.js runtime, force-dynamic)
- **Prisma 5.17** ORM
- **PostgreSQL** (Railway managed)
- **Server-Sent Events** для streaming AI ответов
- **Zod** для валидации входов

### AI / LLM
- **OpenAI** SDK (`gpt-4o-mini` для быстрых объяснений)
- **Anthropic** SDK (`claude-sonnet-4-5` для журналистских отчётов)
- **Perplexity** API (`sonar-pro` для глубокого research)
- **Google Gemini** SDK (fallback)
- Lazy-init pattern для избежания build-time ошибок при отсутствии ключей
- Detеrministic local fallback для каждого AI-вызова

### Инфраструктура
- **Railway** — auto-deploy from GitHub, Postgres, Cron
- **Nixpacks** — buildless infrastructure-as-code (`nixpacks.toml`)
- **GitHub Actions** ready (можно подключить CI)

### Безопасность
- `CRON_SECRET` для защиты `/api/cron/poll`
- `TELEGRAM_WEBHOOK_SECRET` для верификации Telegram webhook'ов
- Все секреты в Railway Variables (не в репозитории)
- `.env*` в `.gitignore` с первого дня
- BigInt-safe JSON serialization

---

## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Клонировать
git clone https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP.git
cd SHAFFOF-ANTIKOR-MVP

# 2. Зависимости
npm install

# 3. Скопировать env-шаблон и заполнить
cp .env.example .env.local
# Отредактируй .env.local — впиши свои реальные ключи (см. ниже)

# 4. Поднять Postgres локально (или используй Railway/Neon/Supabase)
docker run -d --name shaffof-pg \
  -e POSTGRES_PASSWORD=shaffof \
  -e POSTGRES_DB=shaffof \
  -p 5432:5432 postgres:16

# 5. Применить схему
npx prisma db push

# 6. (опционально) посеять демо-данные
npm run db:seed

# 7. Запустить dev-сервер
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

### Минимальный `.env.local`

```env
DATABASE_URL="postgresql://postgres:shaffof@localhost:5432/shaffof"
OPENAI_API_KEY="sk-proj-..."        # для L1 explain + чата
ANTHROPIC_API_KEY="sk-ant-..."      # для L3 report (опционально)
PERPLEXITY_API_KEY="pplx-..."       # для L2 research (опционально)
CRON_SECRET="придумай-длинную-строку"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> ⚠️ **Без AI-ключей всё равно работает** — local fallback сгенерит детерминистские объяснения. Идеально для разработки и DEMO.

---

## 📦 Деплой на Railway (1 минута)

```bash
# Подключаем репо к Railway:
# 1. railway.app → New Project → Deploy from GitHub repo
# 2. Выбираем Wh0mever/SHAFFOF-ANTIKOR-MVP
# 3. + New → Database → Add PostgreSQL
# 4. Web Service → Variables → Add Reference → Postgres → DATABASE_URL
# 5. Добавляем остальные ключи в Raw Editor
# 6. Settings → Networking → Generate Domain
```

`railway.json` + `nixpacks.toml` уже настроены — Railway сам всё подхватит.

После деплоя `prisma db push --accept-data-loss` запускается автоматически в release-фазе.

---

## 📡 Cron-расписание

В Railway → Web Service → **Settings** → **Cron Schedule**:

```
*/5 * * * *
curl -fsS "https://<твой-домен>/api/cron/poll?secret=$CRON_SECRET"
```

Каждые 5 минут:
1. Тянем новые тендеры с `xarid.uzex.uz`
2. Прогоняем через 6 правил детекции
3. Создаём `Alert` записи с risk-score
4. Async fires:
   - `ai.explain()` → сохраняет L1-объяснение в БД
   - `notifyCriticalAlert()` → отправка в Telegram-канал и подписчикам

---

## 🤖 Telegram-бот

```bash
# 1. @BotFather → /newbot → получить TOKEN
# 2. Добавить бота в канал админом → узнать CHANNEL_ID (через @RawDataBot)
# 3. Сгенерить случайный WEBHOOK_SECRET (любая длинная строка)
# 4. Записать всё в Railway Variables
# 5. Установить webhook:
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<домен>/api/telegram&secret_token=<SECRET>"
```

Готово — бот принимает команды, канал получает критические алерты.

---

## 🧪 Что попробовать в первую очередь

1. Открыть [Live demo](https://shaffof-antikor-mvp-production.up.railway.app)
2. В правом верхнем углу нажать **DEMO** — загрузятся 50 синтетических алертов
3. **Дашборд** → посмотреть KPI, графики, топ заказчиков
4. **Карта** → клик на красный регион → увидеть его тендеры → клик на тендер → открыть AI-разбор с **streaming**
5. **Алерты** → отфильтровать по «Критические» → открыть любой → нажать вкладки **GPT-4o-mini / Perplexity / Claude** → видеть как AI пишет в реальном времени
6. **Связи** → визуальный граф → hover на узел → клик на линию → детали пары
7. **Watchlist** → звёздочка в любой карточке → перейти в `/watchlist` → разрешить уведомления → следить за объектом
8. **AI-чат** (зелёный круг справа внизу) → задать вопрос про текущую страницу

---

## 🎨 Что отличает SHAFFOF от мокапа на хакатоне

| Хакатон-стандарт | SHAFFOF |
|------------------|---------|
| Слайды + figma | **Полностью задеплоенный продукт** |
| Один AI-провайдер | **Multi-provider с fallback** + локальные шаблоны |
| Только мок-данные | **LIVE/DEMO режимы** + cron-сборщик с UZEX |
| README в одну страницу | **Полный API + 5-минутный quickstart** |
| Без real-time | **Streaming AI** + browser notifications + Telegram |
| Без публичного API | **REST с CORS** для прессы и аналитиков |
| Без auth-protection | `CRON_SECRET` + Telegram webhook signature |
| Без graceful degradation | **Никогда не возвращает 500** — всегда есть fallback |

---

## 📊 Метрики проекта

```
22 routes (Next.js)        15 API endpoints      1 Postgres БД
6 правил детекции          3 уровня AI            4 LLM провайдера
14 регионов на карте       50+ React components   ~5000 строк TypeScript
0 внешних UI-библиотек*    100% TypeScript        100% deployed
```

*кроме Recharts для графиков и Lucide для иконок

---

## 🔮 Roadmap после хакатона

- [ ] **Реальный sync с UZEX** — стабильный pipeline с auto-refresh JWT
- [ ] **Auth для журналистов** — личные кабинеты с историей расследований
- [ ] **OCR протоколов** — извлечение данных из PDF-протоколов комиссий
- [ ] **ML-модель** на исторических данных вместо rule-based детекции
- [ ] **i18n** — полная локализация на узбекский (латиница + кириллица)
- [ ] **Telegram WebApp** — полноценный мини-апп внутри бота
- [ ] **Открытый API для NGO** — quota-based доступ для активистов

---

## 📖 Лицензия

MIT — используйте, форкайте, расследуйте.

---

## 🙏 Благодарности

- **xarid.uzex.uz** — публичный портал государственных закупок
- **simplemaps.com** — SVG-карта Узбекистана (free for commercial use)
- **OpenAI · Anthropic · Perplexity · Google** — за доступные API
- **Railway** — за быстрый деплой
- **Анонимные журналисты** — кто проверяет тендеры вручную годами

---

<div align="center">

### 💚 Сделано командой WHOMEVER

**Хакатон «Антикоррупция через технологии» · Узбекистан 2026**

[Live Demo](https://shaffof-antikor-mvp-production.up.railway.app) · [GitHub](https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP) · [Telegram канал](https://t.me/+) · [Связаться с командой](mailto:contact@whomever.uz)

*«Прозрачность — лучшее лекарство от коррупции»*

</div>
