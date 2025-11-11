import { tensor, type Tensor } from "@tensorflow/tfjs";
import Papa from "papaparse";

export async function parseCSV(csv: string, hasHeader = true) {
  return new Promise<{ headers: string[]; rows: string[][] }>((resolve) => {
    setTimeout(() => {
      const result = Papa.parse<string[]>(csv.trim(), { skipEmptyLines: true });
      const data = result.data as string[][];

      if (data.length === 0) {
        resolve({ headers: [], rows: [] });
        return;
      }

      if (hasHeader) {
        const [headers, ...rows] = data;
        resolve({ headers, rows });
      } else {
        const maxCols = Math.max(...data.map((row) => row.length));
        const headers = Array.from({ length: maxCols }, (_, i) => i.toString());
        resolve({ headers, rows: data });
      }
    }, 0);
  });
}

export default class CSV {
  public headers: string[];
  public rows: string[][];

  constructor(headers: string[], rows: string[][]) {
    this.headers = headers;
    this.rows = rows;
  }

  static async fromString(csv: string, hasHeader = true) {
    const { headers, rows } = await parseCSV(csv, hasHeader);
    return new CSV(headers, rows);
  }

  static async fromTensor(t: Tensor, headers?: string[]) {
    // If t is 1D, convert to 2D with one column
    if (t.shape.length === 1) {
      t = t.reshape([t.shape[0], 1]);
    }

    const array = await t.array();
    const rows = (array as any[][]).map((row) =>
      row.map((value) => (typeof value === "number" ? value.toString() : ""))
    );
    if (!headers) {
      headers = Array.from({ length: rows[0]?.length || 0 }, (_, i) =>
        i.toString()
      );
    }

    return new CSV(headers, rows);
  }

  getRows() {
    return this.rows.length;
  }

  getColumns() {
    return this.headers.length;
  }

  shape(): [number, number] {
    return [this.getRows(), this.getColumns()];
  }

  toTensor(): Tensor {
    return tensor(
      this.rows.map((row) => row.map((value) => parseFloat(value) || value)),
      this.shape()
    );
  }
}
