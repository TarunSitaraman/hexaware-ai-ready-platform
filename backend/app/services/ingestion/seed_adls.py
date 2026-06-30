import os
import pandas as pd
from datetime import datetime

def seed_adls_mock():
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_source = os.path.abspath(os.path.join(base_dir, "../../../../sample-data/macroeconomic_indicators.csv"))
    adls_dest = os.path.abspath(os.path.join(base_dir, "../../../data/adls_mock/raw-zone"))

    print(f"Reading from source: {csv_source}")
    if not os.path.exists(csv_source):
        print(f"Source file does not exist at {csv_source}")
        return

    df = pd.read_csv(csv_source)
    print(f"Successfully loaded {len(df)} rows.")

    # Create target directories
    fred_dir = os.path.join(adls_dest, "fred", datetime.now().strftime("%Y/%m/%d"))
    wb_dir = os.path.join(adls_dest, "world_bank", datetime.now().strftime("%Y/%m/%d"))
    
    os.makedirs(fred_dir, exist_ok=True)
    os.makedirs(wb_dir, exist_ok=True)

    # 1. Process FRED (USA only)
    print("Processing FRED data...")
    usa_df = df[df["country"] == "USA"].copy()
    
    # We want a dataframe with columns: date, us_real_gdp, us_inflation_cpi, us_unemployment_rate
    # We construct 'date' as YYYY-MM-DD using year and quarter
    def get_date(row):
        q_month = {1: "03", 2: "06", 3: "09", 4: "12"}
        month = q_month.get(int(row["quarter"]), "01")
        return f"{int(row['year'])}-{month}-01"
        
    usa_df["date"] = usa_df.apply(get_date, axis=1)
    
    # Rename columns to match what RAG expects
    fred_df = usa_df[["date", "gdp_growth_pct", "inflation_pct", "unemployment_pct", "interest_rate_pct"]].copy()
    fred_df = fred_df.rename(columns={
        "gdp_growth_pct": "us_real_gdp",
        "inflation_pct": "us_inflation_cpi",
        "unemployment_pct": "us_unemployment_rate",
        "interest_rate_pct": "us_fed_funds_rate"
    })
    
    import uuid
    # Add unique lineage tracking code to every record
    fred_df["record_id"] = [str(uuid.uuid4()) for _ in range(len(fred_df))]
    
    # Remove duplicate rows (since the source dataset contains rows per sector/indicator)
    fred_df = fred_df.drop_duplicates(subset=["date"]).sort_values("date")
    
    fred_file = os.path.join(fred_dir, "data.csv")
    fred_df.to_csv(fred_file, index=False)
    print(f"Saved FRED data to {fred_file} ({len(fred_df)} rows)")

    # 2. Process World Bank data (All countries)
    print("Processing World Bank data...")
    # Expects columns: date, country.value, value, indicator.value
    wb_df = df.copy()
    wb_df["date"] = wb_df.apply(get_date, axis=1)
    wb_df = wb_df.rename(columns={
        "country": "country.value",
        "indicator_value": "value",
        "indicator_name": "indicator.value"
    })
    
    wb_df = wb_df[["date", "country.value", "value", "indicator.value"]].copy()
    
    # Add unique lineage tracking code to every record
    wb_df["record_id"] = [str(uuid.uuid4()) for _ in range(len(wb_df))]
    
    wb_file = os.path.join(wb_dir, "data.csv")
    wb_df.to_csv(wb_file, index=False)
    print(f"Saved World Bank data to {wb_file} ({len(wb_df)} rows)")

if __name__ == "__main__":
    seed_adls_mock()
