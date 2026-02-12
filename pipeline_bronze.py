"""
BRONZE LAYER: Raw Data Ingestion
Purpose: Load CSVs "as-is" into DataFrames/Parquet for auditability
"""
import pandas as pd
from datetime import datetime
import os

# --- CONFIGURATION ---
RAW_DATA_DIR = '.'
BRONZE_OUTPUT_DIR = 'data/bronze'

# Create output directory
os.makedirs(BRONZE_OUTPUT_DIR, exist_ok=True)

def ingest_to_bronze():
    """Load all source CSVs and save to Parquet (Bronze layer)"""
    
    print("=" * 60)
    print("BRONZE LAYER: RAW DATA INGESTION")
    print("=" * 60)
    
    # Track metadata
    ingestion_timestamp = datetime.now().isoformat()
    
    # --- 1. POS Transactions ---
    print("\n📥 Ingesting POS transactions...")
    df_pos = pd.read_csv(f'{RAW_DATA_DIR}/pos_transactions.csv')
    df_pos['ingestion_timestamp'] = ingestion_timestamp
    df_pos['source_system'] = 'POS'
    
    # Save to Parquet (columnar format, compressed)
    df_pos.to_parquet(f'{BRONZE_OUTPUT_DIR}/pos_transactions.parquet', index=False)
    print(f"   ✅ Saved {len(df_pos)} rows to bronze/pos_transactions.parquet")
    
    # --- 2. E-commerce Orders ---
    print("\n📥 Ingesting E-commerce orders...")
    df_ecom = pd.read_csv(f'{RAW_DATA_DIR}/ecommerce_orders.csv')
    df_ecom['ingestion_timestamp'] = ingestion_timestamp
    df_ecom['source_system'] = 'ECOMMERCE'
    
    df_ecom.to_parquet(f'{BRONZE_OUTPUT_DIR}/ecommerce_orders.parquet', index=False)
    print(f"   ✅ Saved {len(df_ecom)} rows to bronze/ecommerce_orders.parquet")
    
    # --- 3. Warehouse Inventory ---
    print("\n📥 Ingesting Warehouse inventory...")
    df_inv = pd.read_csv(f'{RAW_DATA_DIR}/warehouse_inventory.csv')
    df_inv['ingestion_timestamp'] = ingestion_timestamp
    df_inv['source_system'] = 'WAREHOUSE'
    
    df_inv.to_parquet(f'{BRONZE_OUTPUT_DIR}/warehouse_inventory.parquet', index=False)
    print(f"   ✅ Saved {len(df_inv)} rows to bronze/warehouse_inventory.parquet")
    
    print("\n" + "=" * 60)
    print("✅ BRONZE LAYER COMPLETE - Raw data archived")
    print("=" * 60)
    
    return {
        'pos_rows': len(df_pos),
        'ecom_rows': len(df_ecom),
        'inv_rows': len(df_inv),
        'timestamp': ingestion_timestamp
    }

if __name__ == '__main__':
    stats = ingest_to_bronze()
    print(f"\nIngestion Stats: {stats}")
