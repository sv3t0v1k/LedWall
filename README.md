# S.T.A.G.E. PRO ToolKit

Набор инструментов для технического обеспечения мероприятий, концертов и студийного продакшена.

**Live:** [pd.f50a44.ru](https://pd.f50a44.ru) · **Документация:** `docs/`

---

## Структура проекта

```
S.T.A.G.E. PRO ToolKit/
├── index.html                  — Главная страница (лендинг)
├── assets/
│   ├── css/style.css           — Стили главной страницы
│   ├── js/main.js              — Скрипты (canvas-фон, карусель)
│   └── img/
├── tools/
│   ├── led-wall/
│   │   └── index.html          — LED Wall Alignment
│   ├── dmx-calculator/
│   │   ├── index.html
│   │   └── data/fixtures.json
│   ├── power-budget/
│   │   ├── index.html
│   │   └── data/equipment.json
│   ├── delay-calc/
│   │   └── index.html
│   ├── rigging-calc/
│   │   ├── index.html
│   │   └── data/truss.json
│   ├── mapping-planner/
│   │   └── index.html
│   └── signal-patch/
│       └── index.html
├── docs/
│   ├── README.md               — Архитектура и развёртывание
│   ├── context.md              — Полное описание всех инструментов
│   └── rules.md                — Правила работы с проектом
├── Dockerfile
├── Caddyfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

## Инструменты

| Инструмент | Статус | Описание |
|---|---|---|
| **LED Wall Alignment** | ✅ | Визуальная разметка LED-стен, экспорт PNG/SVG/PDF |
| **DMX Universe Calculator** | ✅ | DMX-вселенные, адресация, коллизии, DMX-карта, Plot view |
| **Power Budget** | ✅ | Электропитание: фазы L1/L2/L3, кабель ПУЭ, генератор |
| **Delay & Array Calculator** | ✅ | Линии задержки, Line Array, Subwoofer |
| **Rigging Load Calculator** | ✅ | Нагрузки на трисс BT, 2/3 опоры, эпюра моментов |
| **Mapping Planner** | ✅ | Раскладка плоскостей на canvas, drag, snap, импорт тест-карт |
| **Signal Flow Patch Designer** | ✅ | Конструктор сигнальных цепей Audio/DMX/SDI/Net |

## Стек

- Чистый HTML + CSS + JavaScript (Canvas 2D) — без фреймворков
- Шрифт Inter (Google Fonts), иконки Font Awesome 6 (CDN)
- inline CSS/JS в каждом инструменте — максимальная простота, offline-first
- Canvas-фон с атмосферной подсветкой (световые лучи, haze, scan-line)

## Мобильная адаптация

- Touch-события на всех canvas-инструментах (drag, pan, pinch-zoom)
- Collapsible секции в сайдбаре на мобильных
- Touch-цели ≥44px
- Гамбургер-меню на лендинге
- `prefers-reduced-motion` — анимации отключаются

## Deploy

```bash
docker compose build
docker compose up -d
```

Сервер: Ubuntu 22.04, домен `pd.f50a44.ru`, Nginx Proxy Manager.
Автообновление: cron `0 */8 * * *`.

## Разработка

См. `docs/rules.md` — правила работы с проектом.

## Лицензия

MIT
