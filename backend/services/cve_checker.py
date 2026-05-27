from services.cve_db import CVE_DATABASE

def check_cve(product, version):
    results = []

    if product in CVE_DATABASE:
        for entry in CVE_DATABASE[product]:
            if entry["version"] in version:
                results.append(entry)

    return results