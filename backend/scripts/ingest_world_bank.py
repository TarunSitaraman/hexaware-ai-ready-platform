import wbgapi as wb
import pandas as pd
from datetime import datetime
import os
import argparse

# Define the macroeconomic indicators we want to fetch
INDICATORS = {
    'NY.GDP.MKTP.KD.ZG': 'gdp_growth',          # GDP growth (annual %)
    'FP.CPI.TOTL.ZG': 'inflation',              # Inflation, consumer prices (annual %)
    'SL.UEM.TOTL.ZS': 'unemployment',           # Unemployment, total (% of total labor force)
    'FR.INR.RINR': 'interest_rate'              # Real interest rate (%)
}

# Major economies to track (ISO3 codes)
COUNTRIES = ['USA', 'GBR', 'DEU', 'FRA', 'JPN', 'CAN', 'ITA', 'IND', 'CHN', 'BRA', 'AUS']

def fetch_macro_data(start_year=2018, end_year=2025):
    print(f"Fetching data from World Bank API for years {start_year}-{end_year}...")
    
    time_range = range(start_year, end_year + 1)
    
    # Fetch data as a pandas DataFrame
    # wb.data.DataFrame returns a multi-index dataframe (economy, series)
    df_raw = wb.data.DataFrame(
        series=list(INDICATORS.keys()),
        economy=COUNTRIES,
        time=time_range,
        numericTimeKeys=True, # Column headers will be integers (years)
        columns='series'      # Pivots the series codes into columns
    )
    
    # Reset index to flatten the dataframe (economy, time)
    df = df_raw.reset_index()
    
    # Rename columns to human-readable names
    rename_mapping = {'economy': 'country', 'time': 'year'}
    rename_mapping.update(INDICATORS)
    df = df.rename(columns=rename_mapping)
    
    # Format the date column to look like YYYY-MM-DD (assuming Jan 1st for annual data)
    df['date'] = df['year'].apply(lambda x: f"{x}-01-01")
    df = df.drop(columns=['year'])
    
    # Rearrange columns
    cols = ['date', 'country', 'gdp_growth', 'inflation', 'unemployment', 'interest_rate']
    # If some indicators failed to fetch, ensure they exist with NaNs
    for col in cols:
        if col not in df.columns:
            df[col] = pd.NA
            
    df = df[cols]
    
    # Sort by country and date
    df = df.sort_values(['country', 'date'], ascending=[True, False]).reset_index(drop=True)
    
    # Round numeric columns to 2 decimal places
    numeric_cols = ['gdp_growth', 'inflation', 'unemployment', 'interest_rate']
    df[numeric_cols] = df[numeric_cols].round(2)
    
    return df

def save_to_landing_zone(df, filename="macroeconomic_indicators.csv"):
    # Determine the project root (2 levels up from backend/scripts/ingest_world_bank.py)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    
    # Save to the sample-data directory (which acts as our local landing zone for MVP)
    landing_zone_dir = os.path.join(project_root, 'sample-data')
    os.makedirs(landing_zone_dir, exist_ok=True)
    
    filepath = os.path.join(landing_zone_dir, filename)
    df.to_csv(filepath, index=False)
    print(f"\nSuccessfully ingested {len(df)} records.")
    print(f"Data saved to: {filepath}")
    
    # Show a brief summary of data quality
    print("\nData Completeness Summary:")
    print(df.notna().sum() / len(df) * 100)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Ingest macroeconomic data from the World Bank API.')
    parser.add_argument('--start', type=int, default=2018, help='Start year (default: 2018)')
    parser.add_argument('--end', type=int, default=datetime.now().year, help='End year (default: current year)')
    args = parser.parse_args()
    
    data = fetch_macro_data(start_year=args.start, end_year=args.end)
    save_to_landing_zone(data)
