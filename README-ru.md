# @gravity-ui/timeline [![npm package](https://img.shields.io/npm/v/@gravity-ui/timeline)](https://www.npmjs.com/package/@gravity-ui/timeline) [![Release](https://img.shields.io/github/actions/workflow/status/gravity-ui/timeline/release.yml?branch=main&label=Release)](https://github.com/gravity-ui/timeline/actions/workflows/release.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685)](https://preview.gravity-ui.com/timeline/)

> [English](./README.md)

React-библиотека для построения интерактивных временных шкал с рендерингом на canvas.

## Документация

Подробности см. в [Документации](./docs/docs.md).

## Превью

Базовая шкала с событиями и осями:

![Базовая шкала с событиями](./docs/img/lines.png)

Кастомный вариант с раскрывающимися вложенными событиями (пример [NestedEvents](https://preview.gravity-ui.com/timeline/?path=/story/integrations-gravity-ui--nested-events-story)):

![Вложенные события на шкале](./docs/img/events.png)

## Возможности

- Рендеринг на canvas для высокой производительности
- Интерактивная шкала с масштабированием и панорамированием
- Гибкая настройка wheel и trackpad-жестов, включая передачу вертикального скролла родителю
- Поддержка событий, маркеров, секций, осей и сетки
- Фоновые секции для визуальной организации и выделения периодов
- Умная группировка маркеров с автоматическим зумом по группе — клик по сгруппированным маркерам приближает их по отдельности
- Виртуализированный рендеринг для больших наборов данных (включается, когда содержимое шкалы выходит за пределы видимой области)
- Настраиваемый внешний вид и поведение
- Поддержка TypeScript с полными типами
- Интеграция с React и кастомными хуками

## Установка

```bash
npm install @gravity-ui/timeline
```

## Использование

Компонент временной шкалы можно использовать в React-приложениях с такой базовой настройкой:

```tsx
import { TimelineCanvas, useTimeline } from '@gravity-ui/timeline/react';

const MyTimelineComponent = () => {
  const { timeline, api, start, stop } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 3600000, // через 1 час
      axes: [],
      events: [],
      markers: [],
      sections: []
    },
    viewConfiguration: {
      // Опциональная конфигурация вида
    }
  });

  // timeline — экземпляр Timeline
  // api — экземпляр CanvasApi (то же, что timeline.api)
  // start — функция инициализации шкалы с canvas
  // stop — функция уничтожения шкалы

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <TimelineCanvas timeline={timeline} />
    </div>
  );
};
```

### Структура оси

Каждая ось задаётся так:

```typescript
type TimelineAxis = {
  id: string;          // Уникальный идентификатор оси
  tracksCount: number; // Количество треков на оси
  top: number;         // Вертикальная позиция (px)
  height: number;      // Высота одного трека (px)
};
```

### Горизонтальные линии оси

Положение горизонтальных линий задаётся через `viewConfiguration.axes.linePosition`:

- `"center"` (по умолчанию) рисует линию через центр каждого трека.
- `"between"` рисует линию после каждого трека, по его нижней границе. Режим подходит для табличных строк с событиями по центру.

```typescript
viewConfiguration: {
  axes: {
    linePosition: 'between'
  }
}
```

### Гибкая настройка взаимодействий камеры

`ZoomMode` задаёт привычный preset взаимодействий, а `camera.interactions` позволяет переопределить отдельный жест. Это удобно, когда шкала находится внутри вертикально прокручиваемой страницы: горизонтальное перемещение и зум с trackpad сохраняются, а обычный wheel передаётся родительскому контейнеру.

```tsx
import {ZoomMode} from '@gravity-ui/timeline';

const {timeline} = useTimeline({
  settings: { /* ... */ },
  viewConfiguration: {
    camera: {
      zoom: ZoomMode.DEFAULT,
      interactions: {
        verticalWheel: 'pass-through',
        horizontalWheel: 'pan',
        pinch: 'zoom',
      },
      minRange: 5_000,
      maxRange: 1000 * 60 * 60 * 24 * 365,
    },
  },
});
```

Для каждого взаимодействия доступны `'zoom'`, `'pan'` и `'pass-through'`. `pinch` соответствует Ctrl+wheel, который браузер генерирует для zoom-жеста на trackpad. `minRange` и `maxRange` задаются в миллисекундах: минимум по умолчанию — 5 секунд, а максимум не ограничен, пока его не указали. Настройку можно попробовать в интерактивном [примере Camera interactions в Storybook](https://preview.gravity-ui.com/timeline/?path=/story/components-timelinecanvas--interaction-and-focus).

### Структура секции

Каждая секция должна иметь такую структуру:

```typescript
type TimelineSection = {
  id: string;               // Уникальный идентификатор секции
  from: number;             // Начальная метка времени
  to?: number;              // Конечная метка (опционально, по умолчанию — конец шкалы)
  color: string;            // Цвет фона секции
  hoverColor?: string;      // Цвет при наведении (опционально)
  renderer?: AbstractSectionRenderer; // Опциональный кастомный рендерер (экспортируется из пакета)
};
```

Секции задают фоновую подсветку периодов и помогают визуально организовать содержимое:

```tsx
const MyTimelineComponent = () => {
  const { timeline } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 3600000,
      axes: [],
      events: [],
      markers: [],
      sections: [
        {
          id: 'morning',
          from: Date.now(),
          to: Date.now() + 1800000, // 30 минут
          color: 'rgba(255, 235, 59, 0.3)', // полупрозрачный жёлтый
          hoverColor: 'rgba(255, 235, 59, 0.4)'
        },
        {
          id: 'afternoon',
          from: Date.now() + 1800000,
          // 'to' не указан — до конца шкалы
          color: 'rgba(76, 175, 80, 0.2)', // полупрозрачный зелёный
          hoverColor: 'rgba(76, 175, 80, 0.3)'
        }
      ]
    },
    viewConfiguration: {
      sections: {
        hitboxPadding: 2 // Отступ для определения наведения
      }
    }
  });

  return <TimelineCanvas timeline={timeline} />;
};
```

### Структура маркера

Каждый маркер должен иметь такую структуру:

```typescript
type TimelineMarker = {
  time: number;           // Метка времени позиции маркера
  color: string;          // Цвет линии маркера
  activeColor: string;    // Цвет при выборе (обязательно)
  hoverColor: string;     // Цвет при наведении (обязательно)
  lineWidth?: number;     // Толщина линии (опционально)
  label?: string;         // Подпись (опционально)
  labelColor?: string;    // Цвет подписи (опционально)
  renderer?: AbstractMarkerRenderer; // Опциональный кастомный рендерер
  nonSelectable?: boolean;// Нельзя выбрать
  group?: boolean;        // Маркер представляет группу
};
```

### Группировка маркеров и зум

Шкала автоматически группирует близкие маркеры и поддерживает зум:

```tsx
const MyTimelineComponent = () => {
  const { timeline } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 3600000,
      axes: [],
      events: [],
      markers: [
        // Эти маркеры будут сгруппированы
        { time: Date.now(), color: '#ff0000', activeColor: '#ff5252', hoverColor: '#ff1744', label: 'Событие 1' },
        { time: Date.now() + 1000, color: '#ff0000', activeColor: '#ff5252', hoverColor: '#ff1744', label: 'Событие 2' },
        { time: Date.now() + 2000, color: '#ff0000', activeColor: '#ff5252', hoverColor: '#ff1744', label: 'Событие 3' },
      ]
    },
    viewConfiguration: {
      markers: {
        collapseMinDistance: 8,        // Группировать маркеры в пределах 8 пикселей
        groupZoomEnabled: true,        // Зум по клику на группу
        groupZoomPadding: 0.3,         // Отступ 30% вокруг группы
        groupZoomMaxFactor: 0.3,       // Максимальный коэффициент зума
      }
    }
  });

  // Слушаем зум по группе
  useTimelineEvent(timeline, 'on-group-marker-click', (data) => {
    console.log('Группа увеличена:', data);
  });

  return <TimelineCanvas timeline={timeline} />;
};
```

## Как это устроено

Компонент временной шкалы построен на React и даёт гибкий способ создавать интерактивные шкалы. Кратко об устройстве:

### Архитектура компонента

Шкала настраивается двумя основными объектами:

1. **TimelineSettings** — ядро шкалы и отображение:
   - `start`: начало шкалы
   - `end`: конец шкалы
   - `axes`: конфигурации осей (см. структуру ниже)
   - `events`: конфигурации событий
   - `markers`: конфигурации маркеров
   - `sections`: конфигурации секций

2. **ViewConfiguration** — вид и взаимодействие:
   - Внешний вид, уровни зума, поведение при взаимодействии
   - Можно кастомизировать или использовать значения по умолчанию

### Обработка событий

Поддерживаются события:

- `on-click` — клик по шкале
- `on-context-click` — правый клик / контекстное меню
- `on-select-change` — изменение выделения
- `on-hover` — наведение на элементы
- `on-leave` — курсор покинул элементы

Пример обработки:

```tsx
import { useTimelineEvent } from '@gravity-ui/timeline/react';

const MyTimelineComponent = () => {
  const { timeline } = useTimeline({ /* ... */ });

  useTimelineEvent(timeline, 'on-click', (data) => {
    console.log('Клик по шкале:', data);
  });

  useTimelineEvent(timeline, 'on-select-change', (data) => {
    console.log('Выделение изменилось:', data);
  });

  return <TimelineCanvas timeline={timeline} />;
};
```

### Интеграция с React

Используются кастомные хуки:

- **useTimeline** — экземпляр шкалы и жизненный цикл:
  - Создание и инициализация
  - Очистка при размонтировании
  - Доступ к экземпляру шкалы

- **useTimelineEvent** — подписки на события и очистка:
  - Управление подписчиками
  - Автоочистка при размонтировании

При размонтировании компонента экземпляр шкалы автоматически уничтожается.

### Поповер события

Установите `@gravity-ui/uikit` и подключите его стили, чтобы показывать детали
события без подписок на наведение и расчёта координат:

```tsx
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import {EventPopup} from '@gravity-ui/timeline/react/uikit';

<>
  <TimelineCanvas timeline={timeline} />
  <EventPopup
    timeline={timeline}
    content={(event) => <EventDetails event={event} />}
  />
</>
```

`EventPopup` открывается через 150 мс и закрывается через 200 мс после ухода
курсора с события. При необходимости задайте `openDelay`, `closeDelay`,
`placement`, `offset`, `className` или `aria-label`. Поповер остаётся открытым,
пока указатель или фокус находятся в его содержимом; Escape и клик снаружи его
закрывают. При перекрытии выбирается последнее событие в порядке данных.
`hoverColor` и `isHovered` отвечают за отрисовку события, `EventPopup` — за UI
его деталей.

### Структура события

События на шкале описываются так:

```typescript
type TimelineEvent = {
  id: string;             // Уникальный идентификатор
  from: number;           // Начальная метка времени
  to?: number;            // Конечная метка (опционально для точечных событий)
  axisId: string;        // ID оси
  trackIndex: number;    // Индекс трека на оси
  renderer?: AbstractEventRenderer; // Опциональный кастомный рендерер
  color?: string;        // Цвет события (опционально)
  hoverColor?: string;   // Цвет при наведении (опционально)
  selectedColor?: string;// Цвет при выделении (опционально)
  cursor?: string;       // CSS-курсор при наведении на событие (опционально)
};
```

Для событий, которые выполняют действие по клику, задайте `cursor: 'pointer'`.
Курсор применяется только над этим событием; при перекрытии используется
последнее событие в порядке данных.

### Цвета Gravity UI

Canvas сам не умеет резолвить CSS-переменные. Timeline резолвит значение вида
`var(--token)` относительно своего canvas, поэтому семантические токены Gravity
UI работают во встроенных событиях, маркерах, секциях, осях, сетке и ruler.

```tsx
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import {ThemeProvider} from '@gravity-ui/uikit';
import {GravityTimelineCanvas} from '@gravity-ui/timeline/react/uikit';

<ThemeProvider theme="light">
  <GravityTimelineCanvas timeline={timeline} />
</ThemeProvider>
```

Передавайте токен в любом поле цвета, например
`color: 'var(--g-color-base-positive-medium)'`. `GravityTimelineCanvas`
автоматически перерисовывает шкалу при смене фактической темы Gravity UI. Для
отсутствующего токена используйте CSS fallback, например
`var(--app-event-color, transparent)`, или вызывайте
`timeline.api.resolveColor(color, fallback)` в кастомном renderer.

Для событий `color` используется обычно, `hoverColor` — при наведении, а
`selectedColor` — после выбора:

```ts
const events = [
  {
    id: 'deploy',
    from: start,
    to: end,
    axisId: 'main',
    trackIndex: 0,
    color: 'var(--g-color-base-positive-medium)',
    hoverColor: 'var(--g-color-base-positive-medium-hover)',
    selectedColor: 'var(--g-color-base-positive-heavy)',
  },
];
```

Кастомный event renderer получает `resolveColor` последним необязательным
аргументом, а marker и section renderers — в объекте параметров.

### Прямое использование в TypeScript

Класс Timeline можно использовать без React (например, с другими фреймворками или в vanilla JS):

```typescript
import { Timeline } from '@gravity-ui/timeline';

const timestamp = Date.now();

// Создание экземпляра
const timeline = new Timeline({
  settings: {
    start: timestamp,
    end: timestamp + 3600000, // через 1 час
    axes: [
      {
        id: 'main',
        tracksCount: 3,
        top: 0,
        height: 100
      }
    ],
    events: [
      {
        id: 'event1',
        from: timestamp + 1800000, // через 30 минут
        to: timestamp + 2400000,    // через 40 минут
        label: 'Sample Event',
        axisId: 'main'
      }
    ],
    markers: [
      {
        id: 'marker1',
        time: timestamp + 1200000, // через 20 минут
        label: 'Important Point',
        color: '#ff0000',
        activeColor: '#ff5252',
        hoverColor: '#ff1744'
      }
    ],
    sections: [
      {
        id: 'section1',
        from: timestamp,
        to: timestamp + 1800000, // первые 30 минут
        color: 'rgba(33, 150, 243, 0.2)', // светло-синий фон
        hoverColor: 'rgba(33, 150, 243, 0.3)'
      }
    ]
  },
  viewConfiguration: {
    zoomLevels: [1, 2, 4, 8, 16],
    hideRuler: false,
    showGrid: true
  }
});

// Инициализация с canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
}

// Подписка на события
timeline.on('on-click', (detail) => {
  console.log('Клик по шкале:', detail);
});

timeline.on('on-select-change', (detail) => {
  console.log('Выделение изменилось:', detail);
});

// Очистка
timeline.destroy();
```

Класс Timeline предоставляет API для управления шкалой:

- **События**:
  ```typescript
  timeline.on('eventClick', (detail) => { /* ... */ });
  timeline.off('eventClick', handler);
  timeline.emit('customEvent', { data: 'custom data' });
  ```

- **Управление данными**:
  ```typescript
  timeline.api.setEvents([...]);
  timeline.api.setAxes([...]);
  timeline.api.setMarkers([...]);
  timeline.api.setSections([...]);
  // setViewConfiguration сливается с текущей конфигурацией
  timeline.api.setViewConfiguration({ hideRuler: true });
  ```

## Примеры

Интерактивные примеры в [Storybook](https://preview.gravity-ui.com/timeline/):

- [Basic Timeline](https://preview.gravity-ui.com/timeline/?path=/story/timeline-events--basic) — простая шкала с событиями и осями
- [Endless Timeline](https://preview.gravity-ui.com/timeline/?path=/story/timeline-events--endless-timelines) — бесконечная шкала
- [Markers](https://preview.gravity-ui.com/timeline/?path=/story/timeline-markers--basic) — шкала с маркерами и подписями
- [Camera interactions](https://preview.gravity-ui.com/timeline/?path=/story/components-timelinecanvas--interaction-and-focus) — настройка wheel, горизонтального скролла и zoom-жеста trackpad
- [Custom Events](https://preview.gravity-ui.com/timeline/?path=/story/timeline-events--custom-renderer) — кастомный рендеринг событий
- [Integrations](https://preview.gravity-ui.com/timeline/?path=/story/integrations-gravity-ui--timeline-ruler) — RangeDateSelection, DragHandler, NestedEvents, Popup, List

## Разработка

### Storybook

В проекте есть Storybook для разработки и документации компонентов.

Запуск:

```bash
npm run storybook
```

Сервер будет доступен на http://localhost:6006.

Сборка статической версии Storybook:

```bash
npm run build-storybook
```

## Лицензия

MIT
