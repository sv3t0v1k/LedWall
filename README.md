# GenMap Toolkit

Набор инструментов для технического обеспечения мероприятий, концертов и студийного продакшена.

## Структура проекта

```
GenMap/
├── index.html                  — Главная страница (лендинг)
├── .gitignore
├── README.md
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
│   └── rigging-calc/
│       ├── index.html
│       └── data/truss.json
└── docs/
    ├── README.md               — Документация
    ├── context.md              — Описание всех инструментов
    └── rules.md                — Правила работы с проектом
```

## Инструменты

| Инструмент | Статус | Описание |
|---|---|---|
| LED Wall Alignment | ✅ | Визуальная разметка LED-стен, экспорт PNG/SVG/PDF |
| DMX Universe Calculator | ✅ | DMX-вселенные, адресация, коллизии, DMX-карта |
| Power Budget | ✅ | Электропитание: фазы L1/L2/L3, кабель ПУЭ, генератор |
| Delay & Array Calculator | ✅ | Линии задержки, Line Array, Subwoofer |
| Rigging Load Calculator | ✅ | Нагрузки на трисс BT, 2/3 опоры, эпюра моментов |

## Стек

Чистый HTML + CSS + JavaScript (Canvas 2D) — без фреймворков и зависимостей.
Шрифт Inter (Google Fonts), иконки Font Awesome 6.

## Разработка

См. `docs/rules.md` — правила работы с проектом.

## Лицензия

MIT
