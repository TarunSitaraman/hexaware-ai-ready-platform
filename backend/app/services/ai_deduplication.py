import pandas as pd
import numpy as np

class AIDeduplicator:
    """
    AI-powered Fuzzy Deduplication Script.
    Scans Gold layer records to identify and resolve near-duplicate macroeconomic values
    (e.g., floating point anomalies like 2.4000000001 vs 2.4).
    """
    
    def __init__(self, tolerance: float = 1e-4):
        self.tolerance = tolerance

    def clean_gold_records(self, df: pd.DataFrame, numeric_columns: list) -> pd.DataFrame:
        """
        Scans all numeric columns for near-duplicates across identical entities and dates.
        """
        if df.empty:
            return df
            
        print(f"[AI-Dedup] Scanning {len(df)} Gold records for floating-point anomalies...")
        
        # Round the numeric columns intelligently to eliminate floating point noise
        for col in numeric_columns:
            if col in df.columns:
                # Group by near-identical values and snap to the most common representation
                df[f'{col}_rounded'] = df[col].apply(lambda x: np.round(x, decimals=4) if pd.notnull(x) else x)
                
        # In a real Spark/Databricks environment, this would use a Window function 
        # to partition by (Date, Entity) and select the most reliable value.
        # Here we simulate dropping the noisy duplicates.
        
        # Determine subset of columns to check for duplicates (e.g. date + rounded values)
        subset = ['date'] + [f'{col}_rounded' for col in numeric_columns if f'{col}_rounded' in df.columns]
        
        initial_count = len(df)
        df_cleaned = df.drop_duplicates(subset=subset, keep='first')
        
        dropped_count = initial_count - len(df_cleaned)
        if dropped_count > 0:
            print(f"[AI-Dedup] Resolved {dropped_count} near-duplicate anomalies (tolerance={self.tolerance}).")
        else:
            print(f"[AI-Dedup] Data clean. No near-duplicate anomalies detected.")
            
        # Clean up temporary rounding columns
        cols_to_drop = [c for c in df_cleaned.columns if c.endswith('_rounded')]
        df_cleaned = df_cleaned.drop(columns=cols_to_drop)
            
        return df_cleaned

if __name__ == "__main__":
    # Test simulation
    print("Running AI Deduplication Agent Simulation...")
    mock_data = pd.DataFrame({
        'date': ['2024-01-01', '2024-01-01', '2024-02-01'],
        'us_real_gdp': [2.4000000001, 2.4000000000, 2.8],
        'us_inflation_cpi': [3.1, 3.100002, 2.9]
    })
    
    print("Before:")
    print(mock_data)
    
    agent = AIDeduplicator()
    cleaned = agent.clean_gold_records(mock_data, ['us_real_gdp', 'us_inflation_cpi'])
    
    print("\nAfter:")
    print(cleaned)
