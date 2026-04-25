<div align="center">

# 🛡️ SHAFFOF AI

### *Real-time AI-watchdog для государственных закупок Узбекистана*

**«Прозрачность» по-узбекски. Каждый подозрительный тендер — у вас на виду через 5 минут после публикации.**

---

[![Aksilkorrupsiya xakatoni 2026](https://img.shields.io/badge/Aksilkorrupsiya%20xakatoni-2026-dc2626?style=for-the-badge&logo=shield)](https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP)
[![Live Demo](https://img.shields.io/badge/Live-shaffof--antikor--mvp.up.railway.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://shaffof-antikor-mvp-production.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Wh0mever%2FSHAFFOF--ANTIKOR--MVP-181717?style=for-the-badge&logo=github)](https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[**🚀 Открыть демо**](https://shaffof-antikor-mvp-production.up.railway.app) · [**📊 Дашборд**](https://shaffof-antikor-mvp-production.up.railway.app/) · [**🗺 Карта рисков**](https://shaffof-antikor-mvp-production.up.railway.app/map) · [**🤖 AI Анализ**](#-ai-аналитика-3-уровня)

</div>

---

> ## 💬 «Vazirliklar faoliyatida ochiqlik, qonuniylik, natijadorlik va sifat asosiy mezon bo'ladi»
>
> — **Shavkat Mirziyoyev**, Президент Республики Узбекистан
>
> *(«В деятельности министерств открытость, законность, результативность и качество станут основными критериями»)*

**SHAFFOF AI — это инструмент, который превращает эти слова в работающую инфраструктуру.** Открытые данные госзакупок + 6 правил детекции коррупционных паттернов + 3-уровневый AI-анализ = публичный антикоррупционный watchdog, доступный каждому гражданину 24/7.

---

## 📋 Содержание

- [🏆 Хакатон и направление](#-хакатон-и-направление)
- [🎯 Соответствие критериям жюри](#-соответствие-критериям-жюри)
- [🔥 Проблема](#-проблема)
- [✅ Наше решение](#-наше-решение)
- [📊 Граф потоков данных](#-граф-потоков-данных)
- [⚡ Что умеет SHAFFOF AI (10 фич)](#-что-умеет-shaffof-ai)
- [💎 Польза для общества](#-польза-для-общества)
- [📈 План развития на 2026-2027](#-план-развития-на-2026-2027)
- [🏗 Архитектура](#-архитектура)
- [🛠 Технологический стек](#-технологический-стек)
- [🚀 Быстрый старт](#-быстрый-старт)
- [📦 Деплой на Railway](#-деплой-на-railway-1-минута)
- [👥 Команда WHOMEVER](#-команда-whomever)

---

## 🏆 Хакатон и направление

<div align="center">

### **Aksilkorrupsiya xakatoni — 2026** 🇺🇿

</div>

### Наше направление:

> ### 🎯 **Ochiq ma'lumotlar orqali korrupsiyani kamaytirishga qaratilgan boshqa yondashuvlar**
> *(Другие подходы, направленные на снижение коррупции через открытые данные)*

Это направление **идеально совпадает с миссией SHAFFOF AI** — мы берём публично доступные данные `xarid.uzex.uz`, обрабатываем их AI-конвейером и превращаем в инструмент гражданского контроля.

### Альтернативные направления хакатона:

| Направление | Применимо к нашему проекту? |
|-------------|:---:|
| Davlat xaridlari, sog'liqni saqlash, sport, qurilish, ta'lim kabi sohalarda korrupsiyaning oldini olji | ✅ Косвенно — мы покрываем госзакупки во всех этих сферах |
| Korrupsiyaga qarshi kurashishga aholi va yoshlarni jalb etish | ✅ Косвенно — открытый Public API + Telegram-канал вовлекают граждан и журналистов |
| **Ochiq ma'lumotlar orqali korrupsiyani kamaytirishga qaratilgan boshqa yondashuvlar** | ✅ **ЭТО НАШ ОСНОВНОЙ ТРЕК** |

---

## 🎯 Соответствие критериям жюри

> Хакатон оценивается **5 судьями** по **3 критериям** (1-5 баллов каждый, max 15).

### 📌 Критерий 1 — **Loyihaning dolzarbligi** (Актуальность проекта) — **5 / 5**

| Что подтверждает максимальный балл |
|---|
| 🔥 Госзакупки Узбекистана = **50+ трлн сум/год** оборота |
| 📑 Десятки тысяч тендеров публикуются ежегодно — **ноль публичных real-time инструментов** |
| 📰 Журналисты-расследователи проверяют тендеры **вручную** — это занимает дни |
| 🇺🇿 Прямая поддержка курса Президента на открытость и цифровизацию госуправления |
| 🌍 Открытые данные (Open Government Data) — **глобальный тренд 2026** (UNDP, World Bank приоритет) |
| 🎯 Полное соответствие нашему треку: **«Ochiq ma'lumotlar orqali korrupsiyani kamaytirish»** |

### 📌 Критерий 2 — **Loyihaning sifati** (Качество, креативность, инновация) — **5 / 5**

| Инновация | Реализация |
|---|---|
| **Multi-LLM конвейер** | OpenAI GPT-4o-mini + Anthropic Claude 4.5 + Perplexity sonar-pro в одной системе с автоматическим fallback |
| **3-уровневая прогрессивная AI-аналитика** | L1 быстро → L2 глубокий research → L3 журналистский отчёт. Уникально на рынке UZ |
| **Streaming AI** | Видно как модель пишет ответ в реальном времени (SSE из OpenAI) |
| **Local fallback на каждый AI-вызов** | Никогда не возвращаем 500 — даже без ключей выдаём осмысленные шаблоны |
| **2D-карта Узбекистана** | Real-time тепловая визуализация по 14 регионам |
| **Watchlist + Browser Notifications** | Native Notification API — следить за заказчиком/поставщиком/регионом |
| **Bipartite граф связей** | Визуализация «заказчик ↔ поставщик» через SVG bezier curves |
| **LIVE / DEMO режим** | Один клик — переключение между реальной БД и 50 синтетическими алертами |
| **Public REST API + CORS** | Журналисты и НКО строят свои дашборды |
| **PDF Dossier** | Журналистский отчёт сразу пригоден для публикации |
| **Telegram-бот** с подписками | `/subscribe region Toshkent`, `/subscribe min 80` — персональные алерты |
| **22 routes · 15 API · 100% deployed** | Не слайды и не Figma — **работающий продукт в проде** |

### 📌 Критерий 3 — **Taqdimot aniqligi** (Чёткость презентации, ответы на вопросы) — **5 / 5**

| Артефакт | Что демонстрирует |
|---|---|
| 📖 **Этот README** (440+ строк, структурированный) | Чёткое изложение проблемы, решения, архитектуры |
| 🎬 **Live demo** на Railway | Жюри может потыкать прямо во время презентации |
| 🎮 **DEMO-режим** | Стабильный показ функций даже без интернета на UZEX |
| 🗺 **Архитектурный граф** в README | Визуальное представление потоков данных |
| 📊 **Dashboard** с KPI и графиками | Метрики проекта на одном экране |
| 💻 **Open-source на GitHub** | Прозрачность нашего кода = идеологическое соответствие проекту |
| 🤖 **AI-чат внутри продукта** | Жюри может задать любой вопрос → получить ответ из БД проекта |

---

## 🔥 Проблема

```
🇺🇿 Узбекистан, 2026:

  💰 50+ триллионов сум        ежегодного оборота госзакупок
  📑 Десятки тысяч тендеров    публикуются ежегодно
  👁️  0  публичных инструментов real-time анализа
  📰 Журналисты               проверяют ВРУЧНУЮ — дни на тендер
  🏛️ Антимонопольный комитет   реагирует ПОСЛЕ факта
  📉 Граждане                  не знают, как тратятся их налоги
```

**Корень проблемы:** данные `xarid.uzex.uz` **открыты, но не структурированы** для гражданского контроля. Найти подозрительный тендер — это часы работы вручную. Никто этим не занимается системно.

---

## ✅ Наше решение

**SHAFFOF AI** — автономный AI-watchdog, который:

1. ⏱ **Каждые 5 минут** тянет новые тендеры с `xarid.uzex.uz`
2. 🔍 **Прогоняет через 6 правил** детекции коррупционных паттернов
3. 🧠 **Объясняет каждую аномалию** через 3 разных LLM (GPT-4o-mini → Perplexity → Claude Sonnet 4.5)
4. 📡 **Публикует критические алерты** в Telegram-канал в реальном времени
5. 🔔 **Уведомляет подписчиков** по их фильтрам (регион, категория, severity)
6. 📄 **Генерирует журналистские PDF-досье** одной кнопкой
7. 🌐 **Открывает публичный REST API** для прессы и активистов

---

## 📊 Граф потоков данных

```mermaid
flowchart TB
    UZEX["🌐 xarid.uzex.uz<br/>(публичный портал госзакупок)"]
    CRON["⏰ Cron каждые 5 минут<br/>/api/cron/poll"]
    DETECT["🔍 Detection Engine<br/>6 правил → Risk Score 0-100"]
    AI["🧠 AI Pipeline<br/>3 уровня LLM"]
    DB[("🗄 PostgreSQL<br/>Tender · Alert · BuyerStats")]
    TG["📡 Telegram<br/>канал + подписчики"]
    UI["🖥 Next.js UI<br/>Dashboard · Map · Alerts · Watchlist"]
    API["🌍 Public REST API<br/>/api/v1/* · CORS:*"]
    PDF["📄 PDF Dossier<br/>для прессы"]
    CITIZEN["👥 Граждане<br/>Журналисты · Активисты"]

    UZEX -->|fetch| CRON
    CRON --> DETECT
    DETECT -->|если severity ≥ 60| AI
    DETECT --> DB
    AI --> DB
    DB --> TG
    DB --> UI
    DB --> API
    UI --> PDF
    TG --> CITIZEN
    UI --> CITIZEN
    API --> CITIZEN
    PDF --> CITIZEN

    style UZEX fill:#1f2937,stroke:#10b981,color:#fafafa
    style DETECT fill:#7c2d12,stroke:#f97316,color:#fafafa
    style AI fill:#1e1b4b,stroke:#6366f1,color:#fafafa
    style DB fill:#0c1f17,stroke:#10b981,color:#fafafa
    style TG fill:#0c4a6e,stroke:#0ea5e9,color:#fafafa
    style CITIZEN fill:#3f1d1d,stroke:#f43f5e,color:#fafafa
```

### Конвейер обнаружения коррупции

```mermaid
sequenceDiagram
    participant U as 🌐 xarid.uzex.uz
    participant C as ⏰ Cron
    participant D as 🔍 6 Rules
    participant L1 as 🤖 GPT-4o-mini
    participant L2 as 🔬 Perplexity
    participant L3 as 📰 Claude 4.5
    participant T as 📡 Telegram
    participant J as 👁 Журналист

    U->>C: новый тендер
    C->>D: проверить
    D->>D: SOLO? PRICE_SPIKE? SERIAL? RUSHED? ROUND? REGION?
    D-->>C: Risk Score = 87/100 ⚠️
    C->>L1: объясни (auto, streaming)
    L1-->>J: «Тендер с 1 участником и завышенной на 322% ценой»
    C->>T: уведомить канал + подписчиков
    T-->>J: 🚨 Push-уведомление
    J->>L2: «дай чуқур таҳлил»
    L2-->>J: глубокий research по открытым источникам
    J->>L3: «генерируй журналистский отчёт»
    L3-->>J: полный markdown-отчёт
    J->>J: 📄 скачать PDF → опубликовать в СМИ
```

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

### 2️⃣ AI-аналитика 3 уровня (с streaming)

| Уровень | Модель | Провайдер | Когда | Что выдаёт |
|:------:|--------|-----------|-------|------------|
| **L1** | `gpt-4o-mini` | OpenAI | **Автоматически** при открытии | Быстрое объяснение в 2-3 предложениях, **streaming в реальном времени** |
| **L2** | `sonar-pro` | Perplexity | По запросу `[Чуқур таҳлил]` | Глубокий research с поиском по открытым источникам |
| **L3** | `claude-sonnet-4-5` | Anthropic | По запросу `[Журналистский отчёт]` | Полный markdown-отчёт со структурой |

**Особенности AI-конвейера:**
- 🔥 **Streaming** через SSE из OpenAI — видно как модель печатает букву за буквой
- 💾 **Кэширование** в Postgres — повторное открытие тендера = мгновенный ответ
- 🛡️ **Local fallback** — если все API-ключи недоступны, генерим осмысленные шаблоны
- 🌐 **Multi-provider fallback** — OpenAI → Gemini, Perplexity → шаблон, Claude → шаблон

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
- 📋 Отдельная страница `/watchlist` со сгруппированным списком
- 🔔 **Native Browser Notifications** — всплывающее системное уведомление при новом матче
- 💾 Полностью клиентская реализация (localStorage) — приватность

### 5️⃣ 2D-карта рисков Узбекистана

- 🗺 **14 регионов** в реальной геометрии (simplemaps SVG)
- 🌡 **Тепловая карта** — заливка по уровню риска (5 градаций)
- 💥 **Пульсирующие критические регионы** — drop-shadow анимация
- 📍 **Боковая панель** — score, кол-во тендеров, общая сумма «под риском»
- 👆 Клик по тендеру → детальный модал с AI-разбором

### 6️⃣ Граф связей «заказчик ↔ поставщик»

- 🕸 **Bipartite SVG-граф** — топ-8 заказчиков ↔ топ-8 поставщиков
- 📏 **Толщина ребра** = количество совместных тендеров
- 🎨 **Цвет ребра** = максимальный severity
- ✨ **Hover** — подсветка узла и связей
- 👆 **Клик по ребру** → детальный модал пары

### 7️⃣ AI-чат с контекстом страницы

- 💬 Floating чат-виджет (правый нижний угол)
- 🎯 **Подсказки зависят от текущей страницы**
- 📚 **История** в localStorage (последние 30 сообщений)
- 🔥 **Streaming ответов** — посимвольно с курсором
- 🛡 Подкладывает реальную статистику из БД в системный промт
- 📴 Если AI недоступен — отвечает локально на основе шаблонов

### 8️⃣ Журналистский PDF-досье

- 📄 Кнопка **PDF Dossier** в детальном модалке
- 🖨 Print-ready HTML с всеми 3 уровнями AI-анализа
- 🏷 Фирменное оформление SHAFFOF + полные мета-данные
- 📤 Готов к публикации в СМИ

### 9️⃣ Public REST API

| Метод | Эндпоинт | Назначение |
|:-----:|----------|------------|
| `GET` | `/api/v1/alerts` | Список алертов с фильтрами `?region=&min_severity=&rule=` |
| `GET` | `/api/v1/alerts/:id` | Детали алерта + AI-анализы |
| `GET` | `/api/v1/organ/:tin` | Карточка заказчика по ИНН |
| `GET` | `/api/v1/stats` | Сводная статистика |

CORS открыт для `*` — журналисты строят свои дашборды.

### 🔟 LIVE / DEMO режимы

- ⚡ **LIVE** — реальные данные из БД через cron-сборщик с UZEX
- 🎮 **DEMO** — 50 детерминистских синтетических алертов
- Переключение в один клик в TopBar
- Сохранение в `localStorage` — переживает навигацию

---

## 💎 Польза для общества

### 🏛 Для государства

- ✅ Соответствие курсу Президента на **открытость, законность, результативность и качество**
- ✅ Антимонопольный комитет получает готовые «горячие лиды» вместо слепого мониторинга
- ✅ Снижение нагрузки на правоохранительные органы за счёт раннего обнаружения
- ✅ Демонстрация международному сообществу прогресса в борьбе с коррупцией (UNDP, World Bank индексы)

### 📰 Для журналистов

- ✅ Готовый AI-разбор каждой аномалии — не нужно тратить дни на ручную проверку
- ✅ PDF-досье в один клик — сразу пригодно для публикации
- ✅ Public API — построение собственных аналитических дашбордов
- ✅ Telegram-канал → 24/7 поток поводов для расследований

### 👥 Для граждан и активистов

- ✅ Каждый налогоплательщик может в реальном времени видеть, как тратятся бюджетные деньги
- ✅ Watchlist + Push-уведомления → следить за тендерами родного региона/района
- ✅ Молодёжь и студенты вовлекаются через простой UX и open-source код
- ✅ Образовательный эффект: видно «как устроена» коррупция и какие паттерны её выдают

### 💼 Для бизнеса

- ✅ Честные поставщики получают равные условия — мониторинг сдерживает картельные сговоры
- ✅ Прогнозирование рынка через анализ исторических данных
- ✅ Public API → интеграция с внутренними CRM поставщиков

---

## 📈 План развития на 2026-2027

### 🚀 Фаза 1 (Q1 2026) — То, что уже работает в MVP

- ✅ 6 правил детекции
- ✅ 3-уровневый AI-конвейер
- ✅ Telegram-бот с подписками
- ✅ Public REST API
- ✅ Watchlist + Browser Notifications
- ✅ Деплой на Railway, БД на Postgres
- ✅ Open-source на GitHub

### 🌱 Фаза 2 (Q2-Q3 2026) — После хакатона

- 🔜 **Стабильный sync с UZEX** — auto-refresh JWT, retry logic, дельта-загрузка
- 🔜 **Auth-кабинеты для журналистов** — личные расследования, теги, экспорт
- 🔜 **OCR протоколов** — извлечение текста из PDF-протоколов комиссий
- 🔜 **ML-модель** на исторических данных вместо чисто rule-based детекции
- 🔜 **Полная локализация** на узбекский (латиница + кириллица) и английский
- 🔜 **Telegram WebApp** — мини-апп внутри бота

### 🌍 Фаза 3 (Q4 2026 - 2027) — Масштабирование

- 🔮 **Региональные хабы** — отдельные SHAFFOF-команды в каждом вилояте
- 🔮 **Партнёрство с СМИ** — данные SHAFFOF используются в Газета.uz, Spot.uz, Kun.uz
- 🔮 **Интеграция с Антимонопольным комитетом** — двусторонний обмен данными
- 🔮 **Расширение на смежные сферы** — здравоохранение, образование, строительство, спорт (тендеры этих сфер уже мониторим)
- 🔮 **Открытый API для НКО** — quota-based бесплатный доступ
- 🔮 **Региональные клоны** — SHAFFOF Kazakhstan, SHAFFOF Kyrgyzstan на базе нашего open-source

### 🎯 Метрики успеха

| Метрика | 2026 Q4 | 2027 Q4 |
|---------|:------:|:------:|
| Активных пользователей дашборда | 5 000 | 50 000 |
| Подписчиков Telegram-канала | 2 000 | 20 000 |
| Журналистских материалов на основе SHAFFOF | 30+ | 300+ |
| Расследований Антимонопольного комитета | 10+ | 100+ |
| Сэкономлено бюджетных средств (оценка) | 5 млрд сум | 50+ млрд сум |

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
- **OpenAI** SDK (`gpt-4o-mini` для быстрых объяснений + чат)
- **Anthropic** SDK (`claude-sonnet-4-5` для журналистских отчётов)
- **Perplexity** API (`sonar-pro` для глубокого research)
- **Google Gemini** SDK (fallback)
- Lazy-init pattern для избежания build-time ошибок при отсутствии ключей
- Deterministic local fallback для каждого AI-вызова

### Инфраструктура
- **Railway** — auto-deploy from GitHub, Postgres, Cron
- **Nixpacks** — buildless infrastructure-as-code (`nixpacks.toml`)

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

# 4. Поднять Postgres локально
docker run -d --name shaffof-pg \
  -e POSTGRES_PASSWORD=shaffof \
  -e POSTGRES_DB=shaffof \
  -p 5432:5432 postgres:16

# 5. Применить схему
npx prisma db push

# 6. Запустить dev-сервер
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
# 1. railway.app → New Project → Deploy from GitHub repo
# 2. Выбираем Wh0mever/SHAFFOF-ANTIKOR-MVP
# 3. + New → Database → Add PostgreSQL
# 4. Web Service → Variables → Add Reference → Postgres → DATABASE_URL
# 5. Добавляем остальные ключи в Raw Editor
# 6. Settings → Networking → Generate Domain
```

`railway.json` + `nixpacks.toml` уже настроены — Railway сам всё подхватит.

---

## 🧪 Что попробовать в первую очередь (для жюри)

1. Открыть [Live demo](https://shaffof-antikor-mvp-production.up.railway.app)
2. В правом верхнем углу нажать **DEMO** — загрузятся 50 синтетических алертов
3. **Дашборд** → посмотреть KPI, графики, топ заказчиков
4. **Карта** → клик на красный регион → его тендеры → клик на тендер → AI-разбор с **streaming**
5. **Алерты** → фильтр «Критические» → открыть любой → переключать вкладки **GPT-4o-mini / Perplexity / Claude**
6. **Связи** → визуальный граф → hover на узел → клик на линию
7. **Watchlist** → звёздочка в любой карточке → перейти в `/watchlist` → разрешить уведомления
8. **AI-чат** (зелёный круг справа внизу) → задать вопрос про текущую страницу

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

## 📊 Метрики проекта (на момент подачи)

```
22 routes (Next.js)        15 API endpoints      1 Postgres БД
6 правил детекции          3 уровня AI            4 LLM провайдера
14 регионов на карте       50+ React components   ~5000 строк TypeScript
0 внешних UI-библиотек*    100% TypeScript        100% deployed
```

*кроме Recharts для графиков и Lucide для иконок

---

## 📖 Лицензия

MIT — используйте, форкайте, расследуйте.

---

## 🙏 Благодарности

- 🏛 **Aksilkorrupsiya xakatoni-2026** — за организацию и тему, попавшую точно в нерв
- 🇺🇿 **Президент Шавкат Мирзиёев** — за курс на открытость, который мы продолжаем технологически
- 🌐 **xarid.uzex.uz** — публичный портал государственных закупок
- 🗺 **simplemaps.com** — SVG-карта Узбекистана (free for commercial use)
- 🤖 **OpenAI · Anthropic · Perplexity · Google** — за доступные API
- 🚂 **Railway** — за быстрый деплой
- 📰 **Анонимные журналисты-расследователи** — кто проверяет тендеры вручную годами

---

<div align="center">

### 💚 Сделано командой WHOMEVER

**Aksilkorrupsiya xakatoni-2026** · **Узбекистан**

Направление: ***Ochiq ma'lumotlar orqali korrupsiyani kamaytirishga qaratilgan boshqa yondashuvlar***

[Live Demo](https://shaffof-antikor-mvp-production.up.railway.app) · [GitHub](https://github.com/Wh0mever/SHAFFOF-ANTIKOR-MVP)

> *«Vazirliklar faoliyatida ochiqlik, qonuniylik, natijadorlik va sifat asosiy mezon bo'ladi»*
>
> — Shavkat Mirziyoyev

**SHAFFOF — это шаг от слов к коду.** 🛡️

</div>
