# S.T.A.G.E. PRO ToolKit — документация

Набор инструментов для технического обеспечения мероприятий, концертов и студийного продакшена.

**Live:** [pd.f50a44.ru](https://pd.f50a44.ru) · **GitHub:** [github.com/sv3t0v1k/LedWall](https://github.com/sv3t0v1k/LedWall)

---

## Архитектура

Проект построен по принципу **минимализма и нулевых зависимостей**.
Каждый инструмент — самодостаточная HTML-страница в папке `tools/`.

### Главная страница

- `index.html` — точка входа, лендинг с навигацией к инструментам
- Canvas-фон на чистом JS — анимированные световые лучи, частицы haze, scan-линия, угловые маркеры (стиль «технический блюпринт»)
- Горизонтальная карусель инструментов с плавным скроллом (drag/стрелки/клавиатура/touch-swipe)
- Плавное появление страниц (fade-in через CSS transition)
- Гамбургер-меню на мобильных

### Страницы инструментов

Каждый инструмент:
- Лежит в `tools/<tool-name>/index.html`
- Содержит все стили и скрипты inline (кроме шрифтов и иконок — CDN)
- Содержит ссылку назад на главную (`../../index.html`)
- Имеет fade-in при загрузке (`body { opacity: 0; transition }` + класс `loaded`)

### Навигация

Все ссылки на инструменты — нативные `<a href="...">`.
На `file://` протоколе ссылки должны указывать полный путь до файла (tools/.../index.html), не на директорию.

### Развёртывание

- Docker-образ на основе caddy:alpine
- docker-compose с общей сетью `npm_proxy-network`
- Автообновление по cron `0 */8 * * *` (git pull → build → up -d)
- CI: GitHub Actions (проверка сборки на push в main)

---

## Инструменты

| Инструмент | Путь | Описание |
|---|---|---|
| **LED Wall Alignment** | `tools/led-wall/` | Разметка LED-экранов: сетка модулей, тест-паттерны, маркеры, идентификация |
| **DMX Universe Calculator** | `tools/dmx-calculator/` | Адресация DMX-приборов, авто-расстановка, коллизии, DMX-карта, Plot view |
| **Power Budget** | `tools/power-budget/` | Расчёт электропитания: фазы L1/L2/L3, автобаланс, кабель ПУЭ, генератор |
| **Delay & Array Calculator** | `tools/delay-calc/` | Линии задержки, Line Array splay, Subwoofer End-Fire/Gradient |
| **Rigging Load Calculator** | `tools/rigging-calc/` | Расчёт ферм: BT 30×30/45°/52°, 2/3 опоры, эпюра моментов |
| **Mapping Planner** | `tools/mapping-planner/` | Раскладка видеоплоскостей: drag, snap, выравнивание, импорт тест-карт |
| **Signal Flow Patch Designer** | `tools/signal-patch/` | Конструктор сигнальных цепей: Audio/DMX/SDI/Net блоки, соединения |

---

## Общий UI-паттерн

- Тёмная тема (`#0a0a0f`), циановый акцент (`#00d4ff`)
- Карточки с glassmorphism: `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.06)`
- Боковая панель (сайдбар) слева, основная область справа
- На мобильных (<700px) — сайдбар сверху, контент снизу, коллапсируемые секции
- Touch-цели ≥44px на мобильных
- Toast-уведомления (снизу по центру на мобильных)
- Ripple-эффект на кнопках
- `prefers-reduced-motion` — все анимации отключаются

---

## Мобильная адаптация

- **Touch-события** на всех canvas-инструментах: drag, resize, pan, pinch-to-zoom
- **Гамбургер-меню** на лендинге
- **Брейкпоинты:** 900px (сужение сайдбара), 700px (сайдбар сверху), 480px (одна колонка)
- **Collapsible секции** сайдбара на мобильных
- **`overflow-x: auto`** на таблицах с большим числом колонок

---

## Добавление нового инструмента

1. Создать `tools/<tool-name>/index.html`
2. Убедиться, что страница самодостаточна
3. Добавить на страницу:
   - `body { opacity:0; transition }` + `body.loaded` на DOMContentLoaded
   - Ссылка `../../index.html` для возврата
   - Touch-события для canvas-взаимодействий (если есть canvas)
   - Collapse-секции: функция `initCollapse()` + CSS в `@media(max-width:700px)`
4. Добавить карточку в карусель на главной (`index.html`)
5. Обновить таблицу в `README.md` и описание в `docs/context.md`

---

## Deploy

```bash
# Сборка образа
docker compose build

# Запуск
docker compose up -d

# Обновление (через git pull)
bash scripts/update-genmap.sh
```

Сервер: Ubuntu 22.04 на `192.168.3.44`, домен `pd.f50a44.ru`, прокси — Nginx Proxy Manager.
