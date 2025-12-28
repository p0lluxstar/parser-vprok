# parser-vprok

Парсер для сайта vprok.ru, который извлекает информацию о товарах с помощью Puppeteer.

## Описание

Проект предоставляет два типа парсеров:

1. **Парсер отдельного товара** (`puppeteer.ts`) - извлекает данные о конкретном товаре (цена, старая цена, рейтинг, количество отзывов) и создаёт скриншот страницы
2. **Парсер списка товаров** (`api-parser.ts`) - извлекает данные о всех товарах со страницы категории/каталога из JSON данных **NEXT_DATA**

## Технологии

- **TypeScript** - основной язык разработки
- **Puppeteer** - автоматизация браузера для парсинга
- **puppeteer-extra** и **puppeteer-extra-plugin-stealth** - обход детекции автоматизации
- **Node.js** - среда выполнения

## Установка

1. Клонируйте репозиторий или скачайте проект

```bash
git clone https://github.com/p0lluxstar/parser-vprok.gi
```

2. Установите зависимости:

```bash
npm install
```

## Использование

### Парсер отдельного товара

Парсит данные о конкретном товаре и сохраняет их в `parsed/product.txt`, а также создаёт скриншот в `parsed/screenshot.jpg`.

**Синтаксис:**

```bash
node puppeteer.ts <URL> <REGION>
```

**Параметры:**

- `URL` - ссылка на страницу товара на vprok.ru
- `REGION` - название региона (например, "Москва")

**Пример:**

```bash
node puppeteer.js https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202 "Санкт-Петербург и область"
```

**Результат:**

- `parsed/product.txt` - файл с данными о товаре (цена, старая цена, рейтинг, количество отзывов)
- `parsed/screenshot.jpg` - скриншот страницы товара

### Парсер списка товаров

Парсит все товары со страницы категории/каталога и сохраняет их в `parsed/products-api.txt`.

**Синтаксис:**

```bash
node api-parser.ts <URL>
```

**Параметры:**

- `URL` - ссылка на страницу категории/каталога на vprok.ru

**Пример:**

```bash
node api-parser.ts https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory 
```

**Результат:**

- `parsed/products-api.txt` - файл с данными о всех товарах со страницы

## Структура проекта

```
parser-vprok/
├── src/
│   ├── puppeteer.ts      # Парсер отдельного товара
│   ├── api-parser.ts     # Парсер списка товаров
│   └── interface.ts      # Интерфейсы TypeScript
├── parsed/               # Директория для результатов парсинга
│   ├── product.txt       # Результаты парсинга отдельного товара
│   ├── products-api.txt  # Результаты парсинга списка товаров
│   └── screenshot.jpg    # Скриншот страницы товара
├── package.json
├── tsconfig.json
└── README.md
```