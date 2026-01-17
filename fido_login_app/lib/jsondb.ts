import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

export class JsonFileDB<T extends Record<string, any>> {
  public filePath: string;

  constructor(filePath: string) {
    const cachePath = "cache"; // db파일이 저장되는 위치(cache 폴더 내부)
    this.filePath = path.join(process.cwd(), cachePath, filePath);
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
  }

  async writeAll(rows: T[]): Promise<void> {
    const json = JSON.stringify(rows);
    await fs.promises.writeFile(this.filePath, json);
  }

  async readAll(): Promise<T[]> {
    if (!fs.existsSync(this.filePath)) return [];
    const json = await fs.promises.readFile(this.filePath, "utf-8");
    return JSON.parse(json) as T[];
  }

  async append(rows: T[]): Promise<void> {
    const existing = await this.readAll();
    await this.writeAll([...existing, ...rows]);
  }
}
