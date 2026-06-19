# S.T.A.G.E. PRO ToolKit — контекст проекта

Полное описание всех инструментов, алгоритмов, архитектуры и визуальных решений.

**Live:** [pd.f50a44.ru](https://pd.f50a44.ru) · **GitHub:** [github.com/sv3t0v1k/LedWall](https://github.com/sv3t0v1k/LedWall)

---

## 1. Главная страница (`index.html`)

### Фоновый canvas

Файл: `assets/js/main.js`

Анимированная атмосферная подсветка в стиле концертного света:

- **Световые лучи** — 6 объёмных конусов (на мобиле 3) с цветами: cyan, purple, amber, green, red. Каждый имеет медленный дрифт и пульсацию интенсивности
- **Частицы haze** — 80 плавающих частиц (на мобиле 15) с мерцанием и glow-эффектом, имитация дым-машины
- **Scan-линия** — горизонтальная полоса с мерцанием, движется сверху вниз
- **Угловые маркеры** — 4 уголка в стиле blueprint

Оптимизация:
- Мобильные устройства (<700px): 15 частиц вместо 80, 3 луча вместо 6
- `prefers-reduced-motion`: статичный градиент без анимации, canvas скрыт через CSS

### Карусель инструментов

Файл: `assets/js/main.js`, функция `initCarousel()`

- Горизонтальный `flex`-трек с `transform: translateX`
- Snap по карточкам: offset из суммы ширин предыдущих карточек + gap 24px
- Управление: стрелки, колёсико мыши (горизонтальное), drag, клавиатура ← →, touch-swipe
- Dots + счётчик (`1 / N`)
- `isScrolling` — флаг блокировки на 700ms во время анимации
- Resize: пересчёт позиции с debounce 200ms

### Навигация

- Фиксированный navbar с логотипом и ссылками (Инструменты, О проекте)
- На мобильных (<768px): гамбургер-меню, `.nav-links` выезжают сверху
- Закрытие по клику на ссылку

---

## 2. LED Wall Alignment (`tools/led-wall/`)

### Назначение
Генератор разметки LED-стен с маркерами, тест-паттернами и экспортом.

### Состояние

```javascript
state = {
  pixelPitch: 2.6,
  moduleW: 128, moduleH: 128,
  moduleWmm: 320, moduleHmm: 320,
  gridCols: 4, gridRows: 3,
  markerColor: '#ff3344',
  markers: { cross: true, plus: false, circle: false ... },
  identification: 'alpha-numeric',
  startId: 'top-left',
  testPattern: 'none',
  moduleBorder: true, borderWidth: 1, borderColor: '#ffffff',
  chessColor1: '#ffffff', chessColor2: '#555555',
  sizeLock: true,
  screenName: '', showInfoLabel: true,
  screenNameColor: '#ffffff', screenNameBg: '#000000', screenNameOpacity: 50,
  zoom: 1, panX: 0, panY: 0
}
```

### Canvas interactions
- **Pan** — mousedown + mousemove + mouseup на `#canvas-wrap` + touch-эквиваленты
- **Pinch-to-zoom** — 2 пальца
- Zoom колесом (Ctrl/Meta)

### Экспорт
- **PNG**, **SVG**, **PDF** (window.print)

---

## 3. DMX Universe Calculator (`tools/dmx-calculator/`)

### Назначение
Калькулятор DMX-вселенных: адресация приборов, коллизии, авто-расстановка.

### Данные
Файл: `data/fixtures.json`. Fallback — встроенный DEFAULT_PRESETS.

### Состояние

```javascript
state = {
  fixtures: [{ id, name, channels, address, universe, color }],
  nextId: 2,
  selectedUni: 1,
  zoom: 1,
  plotZoom: 1, plotPanX: 0, plotPanY: 0,
  plotSelId: null
}
```

### Вычисления

- **`buildBitmap(uni)`** — bitmap[513] (1-indexed), каналы с коллизиями
- **`autoAssign()`** — последовательная расстановка с переходом на следующую вселенную при переполнении
- Авто-расстановка через модалку: Compact (все в одну вселенную) / Keep (заполнять существующие)

### Рендер

- DMX-бар 512 каналов с зумом, тултипами, коллизиями (красная штриховка)
- Plot view — canvas с перетаскиваемыми блоками приборов (drag на canvas + touch)
- Таблица приборов с inline-редактированием
- Вкладки Universe 1, 2, 3... с количеством занятых каналов

### Canvas interactions (Plot view)
- **Drag** — клик на блоке → перемещение с snap-to-grid 20px (mousedown + mousemove + mouseup на document + touch)
- **Pan** — клик на пустом месте → панорамирование
- **Pinch-to-zoom** — 2 пальца
- **dblclick** — открыть свойства прибора
- Zoom колесом (Ctrl/Meta)

### Экспорт
- CSV (буфер обмена), JSON (скачать)

---

## 4. Power Budget (`tools/power-budget/`)

### Назначение
Расчёт электропитания: распределение по фазам L1/L2/L3, кабель, генератор.

### Данные
Файл: `data/equipment.json`. Fallback — DEFAULT_PRESETS.

### Состояние

```javascript
state = {
  devices: [{ id, name, power, qty, phase, pf, cat }],
  nextId: 1, cableDist: 50, cableDrop: 3
}
```

### Вычисления

**Базовые формулы:**
- Мощность: `P = power × qty`
- Ток фазы (230V): `I = P / (230 × PF)`
- Полная мощность: `S = P / PF` (kVA)
- Рекомендация генератора: `gen = ceil(S × 1.25 / 5) × 5`

**Auto-Balance:**
1. Каждый прибор поштучно назначается на наименее загруженную фазу
2. Одинаковые приборы на одной фазе группируются

**Дисбаланс:** `deviation% = (phasePower - avg) / maxPhasePower × 100`

**Кабель (ПУЭ, медь, 50°C):**
- Таблица сечений 1.5–95 мм² с допустимым током
- Падение: `ΔU% = (2 × I × L × PF × 100) / (γ × S × 230)`, γ = 57

### Рендер
- Карточки: общая нагрузка, макс. фаза, рекомендация генератора
- Фазовые бары L1/L2/L3 с сегментами по категориям
- Калькулятор кабеля с таблицей сечений
- Таблицы с `overflow-x: auto` на мобильных

---

## 5. Delay & Array Calculator (`tools/delay-calc/`)

### Назначение
Расчёт линий задержки звука, конфигураций Line Array и Subwoofer.

### Состояние

```javascript
state = {
  temp: 20, paDist: 10, paHeight: 8,
  delayDist: 25, delayHeight: 8,
  directDist: 15, useCoords: true,
  arrayCount: 8, cabHeight: 0.37,
  splayStr: '0.5, 1, 1, 2, 2, 3, 4',
  arrayBottom: 2,
  subConfig: 'none',
  subCount: 4, subSpacing: 1.0
}
```

### Вычисления

Скорость звука: `c = 331 + 0.6 × T`

Задержка: `Δt = d / c × 1000` (мс), сэмплы @ 48/96 кГц

Line Array: splay-углы из строки, общий угол, покрытие

Subwoofer: End-Fire / Gradient / Left-Right

### Canvas
Функция `drawSchematic()` — схема расположения PA и Delay с легендой.

---

## 6. Rigging Load Calculator (`tools/rigging-calc/`)

### Назначение
Расчёт нагрузок на триссовые конструкции.

### Данные
Файл: `data/truss.json` (BT 30×30, BT 45°, BT 52° с таблицами допустимых нагрузок).

### Состояние

```javascript
state = {
  trussIdx: 0, span: 12,
  supportMode: '2', motorCap: 1000,
  loads: [{ id, pos, weight, desc }],
  nextId: 1, udl: 10
}
```

### Вычисления

**Интерполяция**: линейная интерполяция udl по span из таблицы трисса

**Численный решатель** (100 сегментов):
- Нагрузка = UDL + собственный вес + точечные нагрузки
- Shear и Moment последовательным интегрированием

**2 опоры**: статически определимая балка
**3 опоры**: разделение на 2 равных пролёта

### Canvas
Функция `drawCanvas()`: трисс, опоры, нагрузки, эпюра моментов.

---

## 7. Mapping Planner (`tools/mapping-planner/`)

### Назначение
Раскладка прямоугольных плоскостей на canvas произвольного разрешения.

### Состояние

```javascript
state = {
  canvasW: 3840, canvasH: 1080,
  gridSize: 32,
  snapGrid: true, snapObjects: true,
  planes: [{ id, label, x, y, w, h, color, img? }],
  nextId: 1,
  zoom: 1, panX: 0, panY: 0,
  selected: [], editingId: null
}
```

### Canvas interactions
- **Move** — mousedown на плоскости → mousemove/mouseup на document + touch
- **Resize** — mousedown на углу(6px) → resize
- **Pan** — mousedown на пустом месте
- **Pinch-to-zoom** — 2 пальца
- **Multi-select** — Shift+клик
- **Zoom** — Ctrl+колесо, кнопки, fit
- **Coord display** — текущие canvas-координаты курсора

### Snap
- **Snap to grid**: `Math.round(val / gridSize) * gridSize`
- **Snap to objects**: align-гайды (центры, края плоскостей и canvas), порог 6px

### Импорт изображений
- Кнопка «Импорт тест-карты» → file dialog → создание плоскости с разрешением изображения
- Изображение отображается внутри плоскости (clip-маска)
- PNG-экспорт включает изображения

### Рендер canvas
5 слоёв: фон → сетка → плоскости (с изображениями) → overlaps → rulers

### Экспорт
- **PNG**: offscreen canvas в полном разрешении
- **SVG**: генерация SVG с rect/text

---

## 8. Signal Flow Patch Designer (`tools/signal-patch/`)

### Назначение
Визуальный конструктор сигнальных цепей: Audio/DMX/SDI/Network.

### Палитра блоков
83+ типа в 7 категориях: Audio In, DMX/Video/Net In, Audio Processing, Video/DMX/Net Processing, Audio Out, Video/DMX/Net Out, Custom.

### Сигналы и цвета
Audio → `#00d4ff`, DMX → `#22c55e`, SDI → `#ef4444`, Network → `#f59e0b`

### Canvas interactions
- **Drag** блоков с snap 40px (mousedown + mousemove + mouseup на canvas + touch)
- **Pan** — drag по пустому месту
- **Connection mode** — клик на out-port → режим → клик на in-port → Безье-кривая
- **Удаление** — клик на кривой, клик на порте в режиме соединения
- **Hover** — курсор crosshair / copy / move / pointer / grab
- **Pinch-to-zoom** — 2 пальца
- **Custom blocks** — сохранение в localStorage

### Экспорт
- **PNG**: offscreen canvas с bounding box всех блоков и соединений

---

## 9. Общие паттерны

### Сохранение состояния
localStorage, ключи: `ledwall_state`, `dmx_state`, `pw_state`, `mp_state`, `sp_state`.
Загрузка при DOMContentLoaded, сохранение при каждом изменении.
Mapping Planner: при превышении лимита localStorage изображения исключаются.

### Toast-уведомления
Функция `toast(message, type, duration)`.
На мобильных (<480px): снизу по центру, `max-width: 100%`.

### Модальное окно
`#modal-overlay` с backdrop-filter + `#modal` карточка.
Закрытие: кнопка Отмена, клик по оверлею, Escape.

### Ripple-эффект
На всех `.btn`: `<span class="ripple">` с scale-анимацией.

### Collapsible секции
На мобильных (<700px) все `.card-header` получают `cursor: pointer` + chevron `\f078`.
Клик → toggle `.collapsed` → скрытие `.card-body`.
Инициализация: `initCollapse()` в DOMContentLoaded.

### Touch-события
Единый паттерн для всех canvas:
1. `touchstart` → сохранение touchId, вызов onPointerDown
2. `touchmove` → вызов onPointerMove с координатами
3. `touchend` → очистка touchId, вызов onPointerUp
4. 2 пальца → pinch-zoom (расстояние → zoom)

`touch-action: none` на всех canvas, canvas-wrap, viewer.

### Адаптивность

| Breakpoint | Сайдбар | Viewer | Прочее |
|---|---|---|---|
| ≥900px | 360px | — | — |
| 700–900px | 320px | padding 12px | — |
| 480–700px | 100% × 40-45vh сверху | 55-60vh | touch-цели 44px, collapse |
| <480px | 35-40vh | — | 1 колонка, toast снизу |

### prefers-reduced-motion
- CSS: `animation-duration: 0.01ms`, `.reveal` без анимации, `#bgCanvas` hidden
- JS: проверка `window.matchMedia('(prefers-reduced-motion: reduce)')` — статичный фон

### Данные через JSON
`fetch('data/...json')`, fallback DEFAULT_PRESETS.
Кастомные добавки в localStorage.

### Deploy
- Docker: caddy:alpine, порт 80
- docker-compose: сеть `npm_proxy-network`
- Cron: `0 */8 * * *` → `scripts/update-genmap.sh` (git pull → docker compose build → up -d)
- CI: GitHub Actions (проверка сборки на push в main)
