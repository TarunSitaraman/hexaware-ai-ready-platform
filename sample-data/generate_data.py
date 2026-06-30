#!/usr/bin/env python3
"""Generate synthetic macroeconomic dataset for the AI-Ready Data Platform MVP."""

import csv
import random
import uuid
from datetime import datetime

random.seed(42)

COUNTRIES = [
    "USA", "China", "Japan", "Germany", "UK",
    "India", "Brazil", "France", "Italy", "Canada",
]

SECTORS = ["overall", "manufacturing", "services", "agriculture", "technology"]
INDICATORS = [
    "gdp_growth_pct", "inflation_pct", "unemployment_pct",
    "interest_rate_pct", "trade_balance_bn", "gdp_bn"
]

BASE_VALUES = {
    "USA":       {"gdp_growth_pct": 2.2, "inflation_pct": 2.5, "unemployment_pct": 4.5, "interest_rate_pct": 3.0, "trade_balance_bn": -60.0, "gdp_bn": 25000, "population_m": 335},
    "China":     {"gdp_growth_pct": 6.0, "inflation_pct": 2.0, "unemployment_pct": 4.0, "interest_rate_pct": 3.5, "trade_balance_bn": 350.0, "gdp_bn": 18000, "population_m": 1410},
    "Japan":     {"gdp_growth_pct": 0.8, "inflation_pct": 0.5, "unemployment_pct": 2.8, "interest_rate_pct": 0.1, "trade_balance_bn": 15.0,  "gdp_bn": 5000,  "population_m": 125},
    "Germany":   {"gdp_growth_pct": 1.2, "inflation_pct": 1.8, "unemployment_pct": 5.0, "interest_rate_pct": 2.0, "trade_balance_bn": 200.0, "gdp_bn": 4200,  "population_m": 84},
    "UK":        {"gdp_growth_pct": 1.5, "inflation_pct": 2.2, "unemployment_pct": 4.2, "interest_rate_pct": 2.5, "trade_balance_bn": -30.0, "gdp_bn": 3200,  "population_m": 68},
    "India":     {"gdp_growth_pct": 6.5, "inflation_pct": 4.5, "unemployment_pct": 6.5, "interest_rate_pct": 5.5, "trade_balance_bn": -80.0, "gdp_bn": 3700,  "population_m": 1420},
    "Brazil":    {"gdp_growth_pct": 1.8, "inflation_pct": 4.0, "unemployment_pct": 9.0, "interest_rate_pct": 8.0, "trade_balance_bn": 40.0,  "gdp_bn": 2100,  "population_m": 215},
    "France":    {"gdp_growth_pct": 1.0, "inflation_pct": 1.6, "unemployment_pct": 8.0, "interest_rate_pct": 2.0, "trade_balance_bn": -50.0, "gdp_bn": 2900,  "population_m": 68},
    "Italy":     {"gdp_growth_pct": 0.6, "inflation_pct": 1.4, "unemployment_pct": 9.5, "interest_rate_pct": 2.0, "trade_balance_bn": 30.0,  "gdp_bn": 2100,  "population_m": 59},
    "Canada":    {"gdp_growth_pct": 1.8, "inflation_pct": 2.0, "unemployment_pct": 5.8, "interest_rate_pct": 2.5, "trade_balance_bn": 10.0,  "gdp_bn": 2100,  "population_m": 40},
}


NARRATIVE_TEMPLATES = [
    "The {country} economy recorded {gdp_desc} GDP growth of {gdp:.1f}% in Q{quarter} {year}, driven by {driver}. Inflation stood at {inf:.1f}%, reflecting {inf_desc}.",
    "In Q{quarter} {year}, {country}'s unemployment rate was {unemp:.1f}% as the labor market {labor_desc}. The central bank maintained interest rates at {ir:.1f}% amid {policy_desc}.",
    "{country} reported a trade balance of {tb:+.1f}B in Q{quarter} {year}, with {tb_desc}. GDP expanded at {gdp:.1f}%, supported by {driver}.",
    "Macroeconomic conditions in {country} during Q{quarter} {year}: GDP growth {gdp:.1f}%, inflation {inf:.1f}%, unemployment {unemp:.1f}%. The {sector} sector showed {sector_desc}.",
]

GDP_ADJS = {"recession": "a contractionary", "slow": "a modest", "moderate": "a steady", "strong": "a robust"}
GDP_DRIVERS = {
    "recession": "weak consumer demand and reduced business investment",
    "slow": "cautious consumer spending and moderate export demand",
    "moderate": "balanced consumer spending and business investment",
    "strong": "strong consumer demand, business investment, and export growth",
}
INF_DESC = {
    "deflation": "falling prices across the economy",
    "low": "benign price pressures below target levels",
    "moderate": "moderate price growth within manageable ranges",
    "high": "elevated price pressures requiring policy attention",
    "hyper": "rapidly rising prices demanding urgent policy response",
}
LABOR_DESC = {
    "low": "remained tight with strong employment growth",
    "moderate": "showed steady improvement",
    "high": "faced persistent slack",
    "very_high": "struggled with elevated joblessness",
}
POLICY_DESC = {
    "low": "accommodative monetary policy conditions",
    "moderate": "a balanced policy stance",
    "high": "tight monetary policy to contain inflation",
    "very_high": "aggressive tightening to combat price pressures",
}
TB_DESC_POS = "driven by strong export performance in {sector} and competitive pricing"
TB_DESC_NEG = "reflecting elevated import demand for {sector} goods and services"


def classify_gdp(gdp: float) -> str:
    if gdp < 0: return "recession"
    if gdp < 2: return "slow"
    if gdp < 4: return "moderate"
    return "strong"

def classify_inflation(inf: float) -> str:
    if inf < 0: return "deflation"
    if inf < 2: return "low"
    if inf < 5: return "moderate"
    if inf < 10: return "high"
    return "hyper"

def classify_unemployment(u: float) -> str:
    if u < 4: return "low"
    if u < 6: return "moderate"
    if u < 9: return "high"
    return "very_high"

def classify_interest(ir: float) -> str:
    if ir < 1: return "low"
    if ir < 3: return "moderate"
    if ir < 6: return "high"
    return "very_high"


def generate_narrative(country, year, quarter, gdp, inf, unemp, ir, tb, sector):
    gdp_cat = classify_gdp(gdp)
    inf_cat = classify_inflation(inf)
    unemp_cat = classify_unemployment(unemp)
    ir_cat = classify_interest(ir)

    template = random.choice(NARRATIVE_TEMPLATES)

    return template.format(
        country=country,
        year=year,
        quarter=quarter,
        gdp=gdp,
        gdp_desc=GDP_ADJS.get(gdp_cat, "stable"),
        inf=inf,
        inf_desc=INF_DESC.get(inf_cat, "stable"),
        unemp=unemp,
        labor_desc=LABOR_DESC.get(unemp_cat, "stable"),
        ir=ir,
        policy_desc=POLICY_DESC.get(ir_cat, "stable"),
        tb=tb,
        tb_desc=TB_DESC_POS.format(sector=sector) if tb > 0 else TB_DESC_NEG.format(sector=sector),
        sector=sector,
        driver=GDP_DRIVERS.get(gdp_cat, "stable economic conditions"),
        sector_desc=f"grew at {abs(gdp):.1f}%" if gdp > 0 else f"contracted by {abs(gdp):.1f}%",
    )


def main():
    rows = []
    dataset_id = f"macro-{datetime.now().strftime('%Y%m%d')}"

    for country in COUNTRIES:
        base = BASE_VALUES[country]
        for year in range(2005, 2025):
            for quarter in range(1, 5):
                for sector in SECTORS:
                    for indicator in INDICATORS:
                        # Generate realistic value with noise and trend
                        trend = (year - 2005) * 0.02
                        noise = random.gauss(0, 0.5)
                        seasonal = random.choice([-0.3, -0.1, 0.1, 0.3])

                        if indicator == "gdp_growth_pct":
                            val = base["gdp_growth_pct"] + trend * 0.5 + noise + seasonal * 0.2
                        elif indicator == "inflation_pct":
                            val = base["inflation_pct"] + noise * 0.8 + seasonal * 0.1
                        elif indicator == "unemployment_pct":
                            val = base["unemployment_pct"] - trend * 0.3 + noise * 0.5
                        elif indicator == "interest_rate_pct":
                            val = base["interest_rate_pct"] + (base["inflation_pct"] + noise) * 0.3 + noise * 0.3
                        elif indicator == "trade_balance_bn":
                            val = base["trade_balance_bn"] + noise * 5 + seasonal * 2
                        elif indicator == "gdp_bn":
                            val = base["gdp_bn"] * (1 + trend) + random.gauss(0, 50)
                        else: # population_m
                            val = base["population_m"] * (1 + (year - 2005) * 0.005) + random.gauss(0, 0.5)

                        val = round(val, 2)
                        ind_val = val

                        # For narrative context, we need rough other values if they aren't the primary indicator
                        other_gdp = val if indicator == "gdp_growth_pct" else base["gdp_growth_pct"] + random.gauss(0, 0.3)
                        other_inf = val if indicator == "inflation_pct" else base["inflation_pct"] + random.gauss(0, 0.3)
                        other_unemp = val if indicator == "unemployment_pct" else base["unemployment_pct"] + random.gauss(0, 0.2)
                        other_ir = val if indicator == "interest_rate_pct" else base["interest_rate_pct"] + random.gauss(0, 0.2)
                        other_tb = val if indicator == "trade_balance_bn" else base["trade_balance_bn"] + random.gauss(0, 5)

                        narrative = generate_narrative(
                            country, year, quarter,
                            other_gdp, other_inf, other_unemp, other_ir, other_tb,
                            sector,
                        )

                        gdp_bn_val = round(base["gdp_bn"] * (1 + (year - 2005) * 0.025) + random.gauss(0, 50), 1)
                        pop_val = round(base["population_m"] * (1 + (year - 2005) * 0.005) + random.gauss(0, 0.5), 1)
                        record_id = str(uuid.uuid4())

                        rows.append({
                            "record_id": record_id,
                            "dataset_id": dataset_id,
                            "country": country,
                            "year": year,
                            "quarter": quarter,
                            "gdp_growth_pct": round(other_gdp, 2),
                            "inflation_pct": round(other_inf, 2),
                            "unemployment_pct": round(other_unemp, 2),
                            "interest_rate_pct": round(other_ir, 2),
                            "trade_balance_bn": round(other_tb, 1),
                            "gdp_bn": gdp_bn_val,
                            "population_m": pop_val,
                            "sector": sector,
                            "indicator_name": indicator,
                            "indicator_value": ind_val,
                            "narrative_text": narrative,
                        })

    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "macroeconomic_indicators.csv")
    fieldnames = [
        "record_id", "dataset_id", "country", "year", "quarter",
        "gdp_growth_pct", "inflation_pct", "unemployment_pct",
        "interest_rate_pct", "trade_balance_bn", "gdp_bn", "population_m",
        "sector", "indicator_name", "indicator_value", "narrative_text",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows -> {output_path}")
    print(f"Dataset ID: {dataset_id}")


if __name__ == "__main__":
    main()