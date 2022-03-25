from owid import catalog

df = catalog.find_one("population", dataset="key_indicators", namespace="owid")
print(df.to_string())
