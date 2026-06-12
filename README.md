# GenMap Toolkit

Набор инструментов для технического обеспечения мероприятий, концертов и студийного продакшена.

## Структура проекта

```
GenMap/
├── index.html                  — Главная страница (лендинг)
├── assets/
│   ├── css/style.css           — Стили главной страницы
│   ├── js/main.js              — Скрипты (canvas-фон, карусель, переходы)
│   └── img/                    — Графика
├── tools/
│   └── led-wall/
│       └── index.html          — LED Wall Alignment Tool
├── docs/
│   └── README.md               — Документация
└── README.md                   — Этот файл
```

## Инструменты

| Инструмент | Статус | Описание |
|---|---|---|
| LED Wall Alignment | ✅ Готов | Визуальная разметка LED-стен, экспорт PNG/SVG/PDF |
| DMX Universe Calculator | 🚧 В разработке | Расчёт DMX-вселенных и адресация |
| Power Budget | 🚧 В разработке | Расчёт электропитания оборудования |
| Cable Manager | 🚧 В разработке | Учёт кабельного парка |
| Stage Geometry | 🚧 В разработке | Планирование сцены |

## Стек

Чистый HTML + CSS + JavaScript (Canvas 2D) — без фреймворков и зависимостей.
Шрифт Inter (Google Fonts), иконки Font Awesome 6.

## Разработка

Ветка `feat/main-page` — разработка главной страницы и структуры.
Ветка `main` — стабильная версия.

```bash
git checkout feat/main-page
# Открой index.html в браузере
```

## Лицензия

MIT
