import os
from dotenv import load_dotenv, find_dotenv

# Automatically find the nearest .env file (looks in parent directories)
load_dotenv(find_dotenv())

from adls_sink import ADLSSink
from worldbank_client import WorldBankClient
from fred_client import FredClient
from datetime import datetime

class IngestionOrchestrator:
    """
    Orchestrates pulling data from multiple external APIs and 
    sinking the raw data directly to ADLS Gen2.
    """
    def __init__(self):
        self.sink = ADLSSink(container_name="raw-zone")
        self.wb_client = WorldBankClient()
        self.fred_client = FredClient()
        
    def run_all(self):
        print("=== Starting Macroeconomic Data Ingestion ===")
        current_year = datetime.now().year
        
        # 1. World Bank (Global Macro)
        wb_data = self.wb_client.fetch_data(start_year=2018, end_year=current_year)
        self.sink.save_dataframe(wb_data, source_name="world_bank", format="csv")
        
        # 2. FRED (US Detailed Macro)
        fred_data = self.fred_client.fetch_data(start_date="2018-01-01")
        self.sink.save_dataframe(fred_data, source_name="fred", format="csv")
        
        print("=== Ingestion Complete ===")

if __name__ == "__main__":
    # Can be run manually or triggered via a Cron Job / Azure Function
    orchestrator = IngestionOrchestrator()
    orchestrator.run_all()
