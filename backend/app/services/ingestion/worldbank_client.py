import wbgapi as wb
import pandas as pd
from datetime import datetime

class WorldBankClient:
    """
    Client for World Bank API using wbgapi.
    No API key required.
    """
    INDICATORS = {
        'NY.GDP.MKTP.KD.ZG': 'gdp_growth',
        'FP.CPI.TOTL.ZG': 'inflation',
        'SL.UEM.TOTL.ZS': 'unemployment',
        'FR.INR.RINR': 'interest_rate'
    }

    COUNTRIES = ['USA', 'GBR', 'DEU', 'FRA', 'JPN', 'CAN', 'ITA', 'IND', 'CHN', 'BRA', 'AUS']

    def fetch_data(self, start_year=2018, end_year=2025) -> pd.DataFrame:
        print(f"[WorldBank] Fetching data for years {start_year}-{end_year}...")
        
        try:
            time_range = range(start_year, end_year + 1)
            df_raw = wb.data.DataFrame(
                series=list(self.INDICATORS.keys()),
                economy=self.COUNTRIES,
                time=time_range,
                numericTimeKeys=True,
                columns='series'
            )
            
            df = df_raw.reset_index()
            rename_mapping = {'economy': 'country', 'time': 'year'}
            rename_mapping.update(self.INDICATORS)
            df = df.rename(columns=rename_mapping)
            
            df['date'] = df['year'].apply(lambda x: f"{x}-01-01")
            df = df.drop(columns=['year'])
            
            cols = ['date', 'country', 'gdp_growth', 'inflation', 'unemployment', 'interest_rate']
            for col in cols:
                if col not in df.columns:
                    df[col] = pd.NA
                    
            df = df[cols].sort_values(['country', 'date'], ascending=[True, False]).reset_index(drop=True)
            return df
        except Exception as e:
            print(f"[WorldBank] Error fetching data: {e}")
            return pd.DataFrame()
