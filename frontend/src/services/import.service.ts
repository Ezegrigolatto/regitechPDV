const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';

export interface ProductField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'number';
}

export interface ParseResult {
  columns: string[];
  preview: Record<string, string>[];
  all_rows: Record<string, string>[];
  total_rows: number;
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  total: number;
  success: number;
  errors: ImportError[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function getProductFields(): Promise<ProductField[]> {
  const res = await fetch(`${BACKEND_URL}/fields`);
  return handleResponse<ProductField[]>(res);
}

export async function parseExcel(file: File): Promise<ParseResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BACKEND_URL}/parse-excel`, { method: 'POST', body: form });
  return handleResponse<ParseResult>(res);
}

export async function importProducts(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  branchId: string,
): Promise<ImportResult> {
  const res = await fetch(`${BACKEND_URL}/import-products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, mapping, branch_id: branchId }),
  });
  return handleResponse<ImportResult>(res);
}
