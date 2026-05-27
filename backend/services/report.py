from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_report(data, filename):

    doc = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()
    content = []

    content.append(Paragraph("AI Red Team Report", styles["Title"]))
    content.append(Spacer(1, 12))

    for target in data.get("results", []):
        content.append(Paragraph(f"Target: {target.get('target', 'Unknown')}", styles["Heading2"]))
        content.append(Spacer(1, 8))

        # ✅ PORTS
        if target.get("scan"):
            content.append(Paragraph("<b>Open Ports:</b>", styles["Normal"]))
            for s in target["scan"]:
                content.append(Paragraph(
                    f"- Port {s.get('port')} | {s.get('service')} ({s.get('product')})",
                    styles["Normal"]
                ))

        content.append(Spacer(1, 8))

        # ✅ VULNERABILITIES
        if target.get("vulnerabilities"):
            content.append(Paragraph("<b>Vulnerabilities:</b>", styles["Normal"]))

            for v in target["vulnerabilities"]:
                content.append(Paragraph(
                    f"{v.get('risk')} - {v.get('issue')} (Port {v.get('port')})",
                    styles["Normal"]
                ))

                # 🔥 CVEs (IMPROVED)
                if v.get("cves"):
                    content.append(Paragraph("<b>CVEs:</b>", styles["Normal"]))

                    for c in v["cves"]:
                        content.append(Paragraph(
                            f"• {c.get('cve')} - {c.get('description')}",
                            styles["Normal"]
                        ))

        content.append(Spacer(1, 12))

    doc.build(content)