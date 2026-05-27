import requests

def fetch_cves(product, version):
    try:
        query = f"{product} {version}"
        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={query}"

        response = requests.get(url)
        data = response.json()

        cves = []

        for item in data.get("vulnerabilities", [])[:3]:  # limit to 3
            cve_data = item.get("cve", {})
            
            cve_id = cve_data.get("id", "N/A")
            
            description = cve_data.get("descriptions", [{}])[0].get("value", "No description")

            cves.append({
                "cve": cve_id,
                "description": description
            })

        return cves

    except Exception as e:
        return []