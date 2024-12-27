import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        const form = formidable({
            uploadDir: path.join(process.cwd(), "public"),
            keepExtensions: true,
            allowEmptyFiles: true, // Дозволяємо обробку порожніх файлів
        });

        if (!fs.existsSync(form.uploadDir)) {
            fs.mkdirSync(form.uploadDir, { recursive: true });
        }

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Помилка обробки форми:", err);
                return res.status(500).json({ error: "Помилка обробки форми" });
            }

            if (!files.audio) {
                console.error("Файл 'audio' не знайдено");
                return res.status(400).json({ error: "Файл 'audio' не знайдено" });
            }

            if (files.audio.size === 0) {
                console.error("Отриманий файл має нульовий розмір");
                return res.status(400).json({ error: "Файл має нульовий розмір" });
            }

            const audioFile = files.audio;
            const fileName = path.basename(audioFile.filepath);

            console.log(`Файл збережено: ${form.uploadDir}/${fileName}`);
            return res.status(200).json({
                message: "Файл збережено",
                filePath: `/public/${fileName}`,
            });
        });
    } else {
        res.status(405).json({ error: "Метод не підтримується" });
    }
}
