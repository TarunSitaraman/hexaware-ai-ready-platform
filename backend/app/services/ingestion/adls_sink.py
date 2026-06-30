import os
import pandas as pd
from datetime import datetime
from azure.storage.blob import BlobServiceClient
from io import BytesIO

class ADLSSink:
    """
    Sinks pandas DataFrames directly into Azure Data Lake Storage Gen2 (ADLS Gen2).
    This maps to the 'Bronze / Raw Zone' of the Medallion Architecture.
    """
    def __init__(self, connection_string: str = None, container_name: str = "raw-zone"):
        self.connection_string = connection_string or os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = container_name
        
        self.client = None
        if self.connection_string:
            try:
                self.client = BlobServiceClient.from_connection_string(self.connection_string)
            except Exception as e:
                print(f"Failed to initialize ADLS client: {e}")

    def save_dataframe(self, df: pd.DataFrame, source_name: str, format: str = "parquet"):
        """
        Saves a dataframe to ADLS Gen2. 
        Path structure: /raw-zone/<source_name>/YYYY/MM/DD/<timestamp>.<format>
        """
        if df.empty:
            print(f"[{source_name}] No data to save.")
            return

        now = datetime.now()
        blob_path = f"{source_name}/{now.strftime('%Y/%m/%d')}/data_{now.strftime('%H%M%S')}.{format}"

        # If we don't have Azure credentials yet, fall back to local disk for development
        if not self.client:
            self._save_local_fallback(df, blob_path, format, source_name)
            return

        try:
            # Convert DF to bytes
            buffer = BytesIO()
            if format == "parquet":
                df.to_parquet(buffer, index=False)
            elif format == "csv":
                df.to_csv(buffer, index=False)
            buffer.seek(0)

            # Upload to Azure
            blob_client = self.client.get_blob_client(container=self.container_name, blob=blob_path)
            blob_client.upload_blob(buffer, overwrite=True)
            print(f"[{source_name}] Successfully uploaded {len(df)} rows to ADLS Gen2: {self.container_name}/{blob_path}")

        except Exception as e:
            print(f"[{source_name}] Failed to upload to ADLS Gen2: {e}")

    def _save_local_fallback(self, df: pd.DataFrame, blob_path: str, format: str, source_name: str):
        """Fallback for local development when AZURE_STORAGE_CONNECTION_STRING is missing"""
        local_dir = os.path.join("data", "adls_mock", self.container_name, os.path.dirname(blob_path))
        os.makedirs(local_dir, exist_ok=True)
        
        local_file = os.path.join("data", "adls_mock", self.container_name, blob_path)
        if format == "parquet":
            df.to_parquet(local_file, index=False)
        elif format == "csv":
            df.to_csv(local_file, index=False)
            
        print(f"[{source_name}] (MOCK ADLS) Saved {len(df)} rows to {local_file}")
