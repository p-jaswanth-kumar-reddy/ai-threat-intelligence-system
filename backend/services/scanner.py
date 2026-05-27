from services.cve_service import fetch_cves
import nmap

def scan_target(ip: str):
    try:
        nm = nmap.PortScanner()
        nm.scan(ip, arguments='-sV')

        results = []

        for host in nm.all_hosts():
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()

                for port in ports:
                    service = nm[host][proto][port]

                    results.append({
                        "port": port,
                        "service": service.get("name", "unknown"),
                        "product": service.get("product", ""),
                        "version": service.get("version", "")
                    })

        return {"status": "success", "data": results}

    except Exception as e:
        return {"status": "error", "message": str(e)}