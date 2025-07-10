import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { log } from './logger.ts';
/**
 * Saves a single row of CSV data to a file with the given base filename.
 * 
 * - Creates a `reporter` folder if it doesn't exist.
 * - Creates the CSV file with a header if it doesn't already exist.
 * - Appends the given row to the CSV file.
 *
 * @async
 * @function saveToCSV
 * @param {string} row - The CSV-formatted string representing a single row of data.
 * @param {string} baseName - The base name for the CSV file (without extension).
 * @throws Will throw an error if file operations fail.
 */
export async function saveToCSV(row: string, baseName: string) {
  const folderPath = path.join('reporter');
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `${baseName}.csv`);

  try {
    if (!existsSync(filePath)) {
      const header = 'Tweet ID,href,Username,Date,Text Tweets,Replies,Reposts,Likes,Is Regular Post,Is Mention,Mention to,Is Quote,Quote to,Is Reply,Reply to\n';
      await fs.writeFile(filePath, header, 'utf-8');
    }

    // lalu append baris baru
    await fs.appendFile(filePath, row + '\n', 'utf-8');
    log("INFO", `✅ Rows added to: ${filePath}`)
  } catch (err) {
    log("ERROR", `❌ Failed to save CSV: ${err}`)
    throw err;
  }
}

/**
 * Appends a JavaScript object to a JSON file.
 * 
 * - Creates a `reporter` folder if it does not exist.
 * - If the JSON file already exists, reads and appends to it.
 * - Otherwise, creates a new JSON file with the object as the first element in an array.
 * 
 * @async
 * @function saveToJSON
 * @param {any} obj - The JavaScript object to be saved.
 * @param {string} baseName - The base name of the JSON file (without extension).
 * @throws Will throw an error if file operations fail or JSON parsing fails.
 */
export async function saveToJSON(obj: any, baseName: string) {
  const folderPath = path.join('reporter');
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `${baseName}.json`);

  try {
    let data: Record<string, string>[] = [];

    // Kalau file json sudah ada, baca datanya dulu
    if (existsSync(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // Tambahkan data baru
    data.push(obj);

    // Tulis ulang seluruh data ke file JSON
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Data JSON ditambahkan ke: ${filePath}`);
  } catch (err) {
    console.error(`❌ Gagal simpan JSON: ${err}`);
    throw err;
  }
}

/**
 * Clean a directory by removing all files and subdirectories inside it.
 * @param {string} directoryPath - The path to the directory to be cleaned.
 */
export function cleanDirectory(directoryPath: string) {
  for (let i = 0; i < directoryPath.length; i++) {
    if (existsSync(directoryPath[i])) {
      for (let a = 0; a < readdirSync(directoryPath[i]).length; a++) {
        const filePath = directoryPath[i] + readdirSync(directoryPath[i])[a];
        fs.rm(filePath, { recursive: true });
      }
    } else {
      log("WARNING", `Warning: your path report "${directoryPath[i]}" does not exist!`)
    }
  }
}