"""
SILVER LAYER: Data Cleaning & Validation
Purpose: Clean, standardize, and validate data from Bronze layer
"""
import pandas as pd
import numpy as np
from datetime import datetime
import os

# --- CONFIGURATION ---
BRONZE_DIR = 'data/bronze'
SILVER_OUTPUT_DIR = 'data/silver'

# Create output directory
os.makedirs(SILVER_OUTPUT_DIR, exist_ok=True)

def clean_sales_data():
    """Combine POS + E-commerce into unified sales dataset"""
    
    print("\n" + "=" * 60)
    print("SILVER LAYER: CLEANING SALES DATA")
    print("=" * 60)
    
    # Load Bronze data
    df_pos = pd.read_parquet(f'{BRONZE_DIR}/pos_transactions.parquet')
    df_ecom = pd.read_parquet(f'{BRONZE_DIR}/ecommerce_orders.parquet')
    
    print(f"\n📊 Loaded {len(df_pos)} POS + {len(df_ecom)} E-com transactions")
    
    # --- STANDARDIZE POS DATA ---
    df_pos_clean = df_pos.rename(columns={
        'transaction_id': 'sale_id',
        'date': 'sale_date',
        'sale_price': 'unit_price'
    })
    df_pos_clean['channel'] = 'OFFLINE'
    df_pos_clean['location'] = df_pos_clean['store_id']
    
    # --- STANDARDIZE E-COMMERCE DATA ---
    df_ecom_clean = df_ecom.rename(columns={
        'order_id': 'sale_id',
        'order_date': 'sale_date',
        'shipping_city': 'location'
    })
    df_ecom_clean['channel'] = 'ONLINE'
    
    # --- COMBINE ---
    common_cols = ['sale_id', 'sale_date', 'product_id', 'quantity', 'unit_price', 'channel', 'location']
    df_sales_unified = pd.concat([
        df_pos_clean[common_cols],
        df_ecom_clean[common_cols]
    ], ignore_index=True)
    
    # --- DATA QUALITY CHECKS ---
    print("\n🔍 Running quality checks...")
    
    # 1. Remove duplicates
    before = len(df_sales_unified)
    df_sales_unified = df_sales_unified.drop_duplicates(subset=['sale_id'])
    print(f"   ✅ Removed {before - len(df_sales_unified)} duplicate sale_ids")
    
    # 2. Handle missing values
    df_sales_unified = df_sales_unified.dropna(subset=['product_id', 'quantity', 'unit_price'])
    print(f"   ✅ Removed rows with missing critical fields")
    
    # 3. Business logic validation
    df_sales_unified = df_sales_unified[df_sales_unified['quantity'] > 0]
    df_sales_unified = df_sales_unified[df_sales_unified['unit_price'] > 0]
    print(f"   ✅ Validated quantity > 0 and price > 0")
    
    # 4. Add calculated fields
    df_sales_unified['total_revenue'] = df_sales_unified['quantity'] * df_sales_unified['unit_price']
    df_sales_unified['sale_date'] = pd.to_datetime(df_sales_unified['sale_date'], format='mixed')
    df_sales_unified['year'] = df_sales_unified['sale_date'].dt.year
    df_sales_unified['month'] = df_sales_unified['sale_date'].dt.month
    df_sales_unified['day_of_week'] = df_sales_unified['sale_date'].dt.day_name()
    
    print(f"\n   💾 Clean sales count: {len(df_sales_unified)}")
    
    # Save to Silver
    df_sales_unified.to_parquet(f'{SILVER_OUTPUT_DIR}/sales_unified.parquet', index=False)
    print(f"   ✅ Saved to silver/sales_unified.parquet")
    
    return df_sales_unified

def clean_inventory_data():
    """Clean warehouse inventory data"""
    
    print("\n" + "=" * 60)
    print("SILVER LAYER: CLEANING INVENTORY DATA")
    print("=" * 60)
    
    df_inv = pd.read_parquet(f'{BRONZE_DIR}/warehouse_inventory.parquet')
    
    print(f"\n📊 Loaded {len(df_inv)} inventory records")
    
    # --- QUALITY CHECKS ---
    print("\n🔍 Running quality checks...")
    
    # 1. Ensure stock_on_hand >= 0
    df_inv['stock_on_hand'] = df_inv['stock_on_hand'].clip(lower=0)
    print(f"   ✅ Enforced stock_on_hand >= 0")
    
    # 2. Add flags
    df_inv['is_low_stock'] = df_inv['stock_on_hand'] < df_inv['reorder_level']
    df_inv['is_out_of_stock'] = df_inv['stock_on_hand'] == 0
    
    # 3. Convert dates
    df_inv['last_updated'] = pd.to_datetime(df_inv['last_updated'])
    
    print(f"   📦 Low stock items: {df_inv['is_low_stock'].sum()}")
    print(f"   ❌ Out of stock items: {df_inv['is_out_of_stock'].sum()}")
    
    # Save to Silver
    df_inv.to_parquet(f'{SILVER_OUTPUT_DIR}/inventory_clean.parquet', index=False)
    print(f"\n   ✅ Saved to silver/inventory_clean.parquet")
    
    return df_inv

def main():
    print("\n" + "=" * 60)
    print("SILVER LAYER PIPELINE - START")
    print("=" * 60)
    
    df_sales = clean_sales_data()
    df_inv = clean_inventory_data()
    
    print("\n" + "=" * 60)
    print("✅ SILVER LAYER COMPLETE - Clean data ready")
    print("=" * 60)
    print(f"\nOutput:")
    print(f"  - sales_unified.parquet: {len(df_sales)} rows")
    print(f"  - inventory_clean.parquet: {len(df_inv)} rows")

if __name__ == '__main__':
    main()
