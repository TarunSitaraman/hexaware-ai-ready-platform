import os
import pandas as pd
import requests
from datetime import datetime

class FredClient:
    """
    Client for Federal Reserve Economic Data (FRED) API.
    Requires FRED_API_KEY environment variable.
    """
    BASE_URL = "https://api.stlouisfed.org/fred/series/observations"
    
    # Common US Macro Indicators
    INDICATORS = {
        'GDPC1': 'us_real_gdp',
        'UNRATE': 'us_unemployment_rate',
        'CPIAUCSL': 'us_inflation_cpi',
        'FEDFUNDS': 'us_fed_funds_rate'
    }

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("FRED_API_KEY")

    def fetch_data(self, start_date="2018-01-01", end_date=None) -> pd.DataFrame:
        if not self.api_key:
            print("[FRED] Warning: FRED_API_KEY not set. Skipping FRED ingestion.")
            return pd.DataFrame()

        end_date = end_date or datetime.now().strftime("%Y-%m-%d")
        print(f"[FRED] Fetching data from {start_date} to {end_date}...")
        
        all_series = []
        for series_id, name in self.INDICATORS.items():
            params = {
                'series_id': series_id,
                'api_key': self.api_key,
                'file_type': 'json',
                'observation_start': start_date,
                'observation_end': end_date
            }
            
            try:
                response = requests.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                df = pd.DataFrame(data['observations'])
                if not df.empty:
                    df = df[['date', 'value']]
                    df['value'] = pd.to_numeric(df['value'], errors='coerce')
                    df = df.rename(columns={'value': name})
                    df['date'] = pd.to_datetime(df['date'])
                    all_series.append(df.set_index('date'))
            except Exception as e:
                print(f"[FRED] Error fetching {series_id}: {e}")

        if not all_series:
            return pd.DataFrame()

        # Merge all series on date
        merged_df = pd.concat(all_series, axis=1).reset_index()
        # Convert date back to string for easier serialization
        merged_df['date'] = merged_df['date'].dt.strftime('%Y-%m-%d')
        
        return merged_df
