import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

(puppeteer as any).use(StealthPlugin());

async function main(): Promise<void> {
    const [, , url, region] = process.argv;

    if (!url || !region) {
        console.error('❌ Ошибка: Не указаны все обязательные параметры');
        process.exit(1);
    }

    const browser = await (puppeteer as any).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Выбор региона
    try {
        
        await page.waitForSelector('[class*="Region_region"]', {
            visible: true,
        });

        await page.click('[class*="Region_region"]');

       
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Поиск кнопки по тексту = region
        const regionButtonFound = await page.evaluate((regionText: string) => {
            const buttons = Array.from(
                document.querySelectorAll(
                    'button[class*="UiRegionListBase_button"]',
                ),
            );
            const button = buttons.find(
                (btn) => btn.textContent.trim() === regionText,
            );
            if (button) {
                (button as HTMLElement).click();
                return true;
            }
            return false;
        }, region);

        if (regionButtonFound) {
            console.log(`✅ Регион выбран: ${region}`);
        } else {
            console.warn(`❌ Регион "${region}" не найден`);
            process.exit(1);
        }


        await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
        console.error('❌ Ошибка выбора региона:', err);
        process.exit(1);
    }

    // Поиск информации о продукте (цены, рейтинг и отзывы)
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const productData = await page.evaluate(() => {
            const oldPriceElement = document.querySelector(
                'span[class*="Price_role_old"]',
            );

            const discountPriceElement = document.querySelector(
                'span[class*="Price_role_discount"]',
            );

            const ratingElement = document.querySelector(
                'a[class*="ActionsRow_stars"]',
            );

            const reviewCountElement = document.querySelector(
                'a[class*="ActionsRow_reviews"]',
            );

            const priceOld = oldPriceElement
                ? oldPriceElement.textContent.trim()
                : null;
            const price = discountPriceElement
                ? discountPriceElement.textContent.trim()
                : null;
            const rating = ratingElement
                ? ratingElement.textContent.trim()
                : null;
            const reviewCount = reviewCountElement
                ? reviewCountElement.textContent.trim()
                : null;

            return { price, priceOld, rating, reviewCount };
        });

        // Запись данных в файл product.txt
        let fileContent = '';
        if (productData.price) {
            fileContent += `price=${formatData(productData.price)}\n`;
        }
        if (productData.priceOld) {
            fileContent += `priceOld=${formatData(productData.priceOld)}\n`;
        }
        if (productData.rating) {
            fileContent += `rating=${formatData(productData.rating)}\n`;
        }
        if (productData.reviewCount) {
            fileContent += `reviewCount=${formatData(productData.reviewCount)}\n`;
        }

        if (fileContent) {
            fs.writeFileSync('../parsed/product.txt', fileContent, 'utf8');
            console.log('✅ Данные записаны в product.txt');
        } else {
            console.warn('❌ Данные не найдены');
        }
    } catch (err) {
        console.error('❌ Ошибка при поиске цен:', err);
    }

    // Создание скриншота после записи данных о продукте
    await page.screenshot({ path: '../parsed/screenshot.jpg', fullPage: true });
    console.log('✅ Скриншот сохранён: screenshot.jpg');

    await browser.close();
}

function formatData(input: string): string {
    const cleaned = input.replace(/[^\d,.]/g, '');
    return cleaned.replace(',', '.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
