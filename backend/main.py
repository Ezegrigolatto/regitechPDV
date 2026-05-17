import io
import os
from typing import Any

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import Client, create_client

load_dotenv()

app = FastAPI(title="regitechPDV Import API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_supabase_url = os.getenv("SUPABASE_URL", "")
_supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")

if not _supabase_url or not _supabase_key:
    raise RuntimeError("Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en .env")

supabase: Client = create_client(_supabase_url, _supabase_key)

PRODUCT_FIELDS = [
    {"key": "name",            "label": "Nombre",           "required": True,  "type": "text"},
    {"key": "sku",             "label": "SKU",              "required": False, "type": "text"},
    {"key": "barcode",         "label": "Código de barras", "required": False, "type": "text"},
    {"key": "description",     "label": "Descripción",      "required": False, "type": "text"},
    {"key": "category_name",   "label": "Categoría",        "required": False, "type": "text"},
    {"key": "cost_price",      "label": "Precio costo",     "required": False, "type": "number"},
    {"key": "retail_price",    "label": "Precio minorista", "required": True,  "type": "number"},
    {"key": "wholesale_price", "label": "Precio mayorista", "required": False, "type": "number"},
    {"key": "stock_min",       "label": "Stock mínimo",     "required": False, "type": "number"},
    {"key": "initial_stock",   "label": "Stock inicial",    "required": False, "type": "number"},
]

NUMBER_FIELDS = {"cost_price", "retail_price", "wholesale_price", "stock_min", "initial_stock"}


def _safe_str(val: Any) -> str | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    return str(val).strip() or None


def _safe_float(val: Any) -> float | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        return float(str(val).replace(",", ".").strip())
    except (ValueError, TypeError):
        return None


# ──────────────────────────────────────────────
# GET /fields
# ──────────────────────────────────────────────
@app.get("/fields")
def get_fields():
    return PRODUCT_FIELDS


# ──────────────────────────────────────────────
# POST /parse-excel
# ──────────────────────────────────────────────
@app.post("/parse-excel")
async def parse_excel(file: UploadFile = File(...)):
    content = await file.read()

    try:
        df = pd.read_excel(io.BytesIO(content), dtype=str)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error leyendo el archivo: {exc}")

    # Normalise: strip whitespace from column names
    df.columns = [str(c).strip() for c in df.columns]

    columns = df.columns.tolist()
    preview = df.head(5).fillna("").to_dict(orient="records")
    all_rows = df.fillna("").to_dict(orient="records")

    return {
        "columns": columns,
        "preview": preview,
        "all_rows": all_rows,
        "total_rows": len(df),
    }


# ──────────────────────────────────────────────
# POST /import-products
# ──────────────────────────────────────────────
class ImportRequest(BaseModel):
    rows: list[dict[str, Any]]
    mapping: dict[str, str]   # excel_col → db_field_key
    branch_id: str


@app.post("/import-products")
async def import_products(body: ImportRequest):
    mapping = body.mapping
    rows = body.rows
    branch_id = body.branch_id

    if not rows:
        raise HTTPException(status_code=400, detail="No hay filas para importar")

    cat_cache: dict[str, str] = {}
    results: dict[str, Any] = {"total": len(rows), "success": 0, "errors": []}

    def resolve_category(name: str) -> str:
        key = name.lower().strip()
        if key in cat_cache:
            return cat_cache[key]

        res = supabase.table("categories").select("id").ilike("name", name.strip()).execute()
        if res.data:
            cat_cache[key] = res.data[0]["id"]
        else:
            new = supabase.table("categories").insert({"name": name.strip()}).select().execute()
            cat_cache[key] = new.data[0]["id"]

        return cat_cache[key]

    def get_default_category() -> str:
        if "_default" in cat_cache:
            return cat_cache["_default"]
        res = supabase.table("categories").select("id").eq("name", "Sin categoría").execute()
        if res.data:
            cat_cache["_default"] = res.data[0]["id"]
        else:
            new = supabase.table("categories").insert({"name": "Sin categoría"}).select().execute()
            cat_cache["_default"] = new.data[0]["id"]
        return cat_cache["_default"]

    for row_index, row in enumerate(rows):
        excel_row_number = row_index + 2  # row 1 = headers
        try:
            product_data: dict[str, Any] = {}
            initial_stock: float | None = None

            for excel_col, db_field in mapping.items():
                raw = row.get(excel_col)

                if db_field == "ignore" or db_field == "":
                    continue

                if db_field == "category_name":
                    val = _safe_str(raw)
                    if val:
                        product_data["category_id"] = resolve_category(val)

                elif db_field == "initial_stock":
                    initial_stock = _safe_float(raw)

                elif db_field in NUMBER_FIELDS:
                    val = _safe_float(raw)
                    if val is not None:
                        product_data[db_field] = val

                else:
                    val = _safe_str(raw)
                    if val is not None:
                        product_data[db_field] = val

            # Validaciones requeridas
            if not product_data.get("name"):
                results["errors"].append({"row": excel_row_number, "message": "Nombre requerido"})
                continue

            if product_data.get("retail_price") is None:
                results["errors"].append({"row": excel_row_number, "message": "Precio minorista requerido"})
                continue

            # Defaults para campos numéricos
            product_data.setdefault("cost_price", 0.0)
            product_data.setdefault("wholesale_price", product_data["retail_price"])
            product_data.setdefault("stock_min", 0.0)
            product_data.setdefault("is_active", True)

            # category_id es requerido en la tabla
            if "category_id" not in product_data:
                product_data["category_id"] = get_default_category()

            # Upsert por SKU: si ya existe el SKU → actualizar, si no → insertar
            existing_id: str | None = None
            if product_data.get("sku"):
                check = supabase.table("products").select("id").eq("sku", product_data["sku"]).execute()
                if check.data:
                    existing_id = check.data[0]["id"]

            if existing_id:
                supabase.table("products").update(product_data).eq("id", existing_id).execute()
                product_id = existing_id
            else:
                inserted = supabase.table("products").insert(product_data).select().execute()
                product_id = inserted.data[0]["id"]

            # Stock inicial
            if initial_stock is not None and initial_stock > 0:
                stock_check = (
                    supabase.table("branch_stock")
                    .select("id")
                    .eq("product_id", product_id)
                    .eq("branch_id", branch_id)
                    .execute()
                )
                if stock_check.data:
                    supabase.table("branch_stock").update({"quantity": initial_stock}).eq("id", stock_check.data[0]["id"]).execute()
                else:
                    supabase.table("branch_stock").insert({
                        "product_id": product_id,
                        "branch_id": branch_id,
                        "quantity": initial_stock,
                    }).execute()

                supabase.table("stock_movements").insert({
                    "product_id": product_id,
                    "branch_id": branch_id,
                    "type": "manual_in",
                    "quantity": initial_stock,
                    "reference_type": "manual",
                    "notes": "Stock inicial — importación masiva",
                }).execute()

            results["success"] += 1

        except Exception as exc:
            results["errors"].append({"row": excel_row_number, "message": str(exc)})

    return results
