"""
GOLD LAYER: Star Schema for Analytics
Purpose: Create business-ready fact and dimension tables
"""
import pandas as pd
import os

# --- CONFIGURATION ---
SILVER_DIR = 'data/silver'
GOLD_OUTPUT_DIR = 'data/gold'

# Create output directory
os.makedirs(GOLD_OUTPUT_DIR, exist_ok=True)

def create_fact_sales():
    """Create FactSales table (central fact table)"""
    
    print("\n" + "=" * 60)
    print("GOLD LAYER: CREATING FACT_SALES")
    print("=" * 60)
    
    df_sales = pd.read_parquet(f'{SILVER_DIR}/sales_unified.parquet')
    
    # Create fact table with foreign keys
    fact_sales = df_sales[[
        'sale_id',
        'sale_date',
        'product_id',
        'location',  # Will link to DimStore/DimLocation
        'channel',
        'quantity',
        'unit_price',
        'total_revenue',
        'year',
        'month'
    ]].copy()
    
    # Add surrogate keys (IDs for linking)
    fact_sales['sale_key'] = range(1, len(fact_sales) + 1)
    
    fact_sales.to_parquet(f'{GOLD_OUTPUT_DIR}/fact_sales.parquet', index=False)
    print(f"✅ Created fact_sales.parquet ({len(fact_sales)} rows)")
    
    return fact_sales

def create_dim_product():
    """Create DimProduct dimension table"""
    
    print("\n" + "=" * 60)
    print("GOLD LAYER: CREATING DIM_PRODUCT")
    print("=" * 60)
    
    # Load sales to get unique products
    df_sales = pd.read_parquet(f'{SILVER_DIR}/sales_unified.parquet')
    
    # Get distinct products (in real scenario, this would come from a products master table)
    dim_product = df_sales[['product_id']].drop_duplicates()
    
    # Add product attributes (placeholder - would come from product catalog)
    dim_product['product_key'] = range(1, len(dim_product) + 1)
    dim_product = dim_product[['product_key', 'product_id']]
    
    dim_product.to_parquet(f'{GOLD_OUTPUT_DIR}/dim_product.parquet', index=False)
    print(f"✅ Created dim_product.parquet ({len(dim_product)} rows)")
    
    return dim_product

def create_dim_location():
    """Create DimLocation (stores/cities)"""
    
    print("\n" + "=" * 60)
    print("GOLD LAYER: CREATING DIM_LOCATION")
    print("=" * 60)
    
    df_sales = pd.read_parquet(f'{SILVER_DIR}/sales_unified.parquet')
    
    # Get distinct locations
    dim_location = df_sales[['location', 'channel']].drop_duplicates()
    dim_location['location_key'] = range(1, len(dim_location) + 1)
    
    dim_location = dim_location[['location_key', 'location', 'channel']]
    
    dim_location.to_parquet(f'{GOLD_OUTPUT_DIR}/dim_location.parquet', index=False)
    print(f"✅ Created dim_location.parquet ({len(dim_location)} rows)")
    
    return dim_location

def create_fact_inventory():
    """Create FactInventory (current stock levels)"""
    
    print("\n" + "=" * 60)
    print("GOLD LAYER: CREATING FACT_INVENTORY")
    print("=" * 60)
    
    df_inv = pd.read_parquet(f'{SILVER_DIR}/inventory_clean.parquet')
    
    # Create fact table
    fact_inventory = df_inv[[
        'warehouse_id',
        'product_id',
        'stock_on_hand',
        'reorder_level',
        'is_low_stock',
        'is_out_of_stock',
        'last_updated'
    ]].copy()
    
    fact_inventory['inventory_key'] = range(1, len(fact_inventory) + 1)
    
    fact_inventory.to_parquet(f'{GOLD_OUTPUT_DIR}/fact_inventory.parquet', index=False)
    print(f"✅ Created fact_inventory.parquet ({len(fact_inventory)} rows)")
    
    return fact_inventory

def main():
    print("\n" + "=" * 60)
    print("GOLD LAYER PIPELINE - START")
    print("=" * 60)
    
    # Create dimension tables first
    dim_product = create_dim_product()
    dim_location = create_dim_location()
    
    # Create fact tables
    fact_sales = create_fact_sales()
    fact_inventory = create_fact_inventory()
    
    print("\n" + "=" * 60)
    print("✅ GOLD LAYER COMPLETE - Analytics-ready!")
    print("=" * 60)
    print(f"\nStar Schema Tables Created:")
    print(f"  📊 FACT_SALES: {len(fact_sales)} rows")
    print(f"  📦 FACT_INVENTORY: {len(fact_inventory)} rows")
    print(f"  🏷️  DIM_PRODUCT: {len(dim_product)} products")
    print(f"  📍 DIM_LOCATION: {len(dim_location)} locations")
    
    # Summary stats
    print(f"\n📈 Quick Stats:")
    print(f"  Total Revenue: ₹{fact_sales['total_revenue'].sum():,.2f}")
    print(f"  Avg Transaction Value: ₹{fact_sales['total_revenue'].mean():,.2f}")
    print(f"  Low Stock Items: {fact_inventory['is_low_stock'].sum()}")
    print(f"  Out of Stock Items: {fact_inventory['is_out_of_stock'].sum()}")

if __name__ == '__main__':
    main()
