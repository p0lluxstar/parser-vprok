import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import { type IProduct } from './interface.ts';

(puppeteer as any).use(StealthPlugin());

async function parseVprok(): Promise<void> {
    const [, , url] = process.argv;

    if (!url) {
        console.error('❌ Ошибка: Не указан обязательный параметр');
        process.exit(1);
    }

    let browser;
    try {
        
        browser = await (puppeteer as any).launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Получение HTML страницы
        const html = await page.content();

        // Получение JSON из __NEXT_DATA__
        const jsonMatch = html.match(
            /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/,
        );

        if (!jsonMatch) {
            throw new Error('__NEXT_DATA__ не найден');
        }

        const nextData = JSON.parse(jsonMatch[1]);

        // Поиск рекурсивно массива products в структуре данных __NEXT_DATA__
        function findProducts(obj: unknown): IProduct[] | null {
            if (typeof obj !== 'object' || obj === null) return null;

            if (
                'products' in obj &&
                Array.isArray((obj as { products: unknown }).products)
            ) {
                return (obj as { products: IProduct[] }).products;
            }

            for (const value of Object.values(obj)) {
                const result = findProducts(value);
                if (result) return result;
            }

            return null;
        }

        const products = findProducts(nextData);

        // Формирование данных для файла
        if (!products) {
            console.log('❌ Массив products не найден');
        } else {
            console.log(`✅ Найдено товаров: ${products.length}`);

            let result = '';

            products.forEach((product: IProduct) => {
                result +=
                    `Название товара: ${product.name}\n` +
                    `Ссылка на страницу товара: https://www.vprok.ru${product.url}\n` +
                    `Рейтинг: ${product.rating}\n` +
                    `Количество отзывов: ${product.reviews}\n` +
                    `Цена: ${product.price}\n` +
                    `Акционная цена: ${product.price}\n` +
                    `Цена до акции: ${product.oldPrice}\n` +
                    `Размер скидки: ${product.discount}\n` +
                    `-----------------------------\n`;
            });

            // Запись дыннах в файл
            fs.writeFileSync('../parsed/products-api.txt', result, 'utf-8');
        }

        console.log('✅ Данные сохранены в products-api.txt');
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Ошибка:', error.message);
        } else {
            console.error('❌ Неизвестная ошибка', error);
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

parseVprok();
