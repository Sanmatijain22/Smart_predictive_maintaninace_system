import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from app.config import settings

def generate_machine_pdf_report(machine, latest_readings, predictions_info, alerts, recommendations) -> bytes:
    """
    Generates a high-quality industrial PDF health report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'), # Navy
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#DC2626'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'), # Industrial Navy Blue
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    bold_body_style = ParagraphStyle(
        'BoldBodyDark',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # 1. Top Header Banner
    header_data = [
        [
            Paragraph("<b>SMARTMFG AI</b><br/><font size='8' color='#2563EB'>PREDICTIVE MAINTENANCE INTELLIGENCE SUITE</font>", header_title_style),
            Paragraph(f"<b>Plant:</b> {settings.PLANT}<br/><b>Dept:</b> {machine.department}<br/><b>Date:</b> {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[340, 200])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_header)

    # Disclaimer Callout Box
    story.append(Spacer(1, 4))
    disclaimer_p = Paragraph(
        "*** DEMO / SIMULATED DATA — INDUSTRIAL MACHINE HEALTH REPORT FOR DEMONSTRATION PURPOSES ONLY ***",
        disclaimer_style
    )
    t_disc = Table([[disclaimer_p]], colWidths=[540])
    t_disc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#F87171')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_disc)
    story.append(Spacer(1, 10))

    # 2. Machine Overview Summary Card
    story.append(Paragraph("1. EQUIPMENT IDENTIFICATION & HEALTH OVERVIEW", section_heading))
    
    status_color = colors.HexColor('#16A34A') if machine.status == 'healthy' else (
        colors.HexColor('#EA580C') if machine.status == 'warning' else colors.HexColor('#DC2626')
    )

    overview_data = [
        [
            Paragraph("<b>Machine ID:</b>", bold_body_style), Paragraph(str(machine.id), body_style),
            Paragraph("<b>Operational Status:</b>", bold_body_style), Paragraph(f"<b><font color='{status_color.hexval()}'>{machine.status.upper()}</font></b>", body_style)
        ],
        [
            Paragraph("<b>Machine Name:</b>", bold_body_style), Paragraph(str(machine.name), body_style),
            Paragraph("<b>Overall Health Score:</b>", bold_body_style), Paragraph(f"<b>{machine.health_score}% / 100</b>", bold_body_style)
        ],
        [
            Paragraph("<b>Department:</b>", bold_body_style), Paragraph(str(machine.department), body_style),
            Paragraph("<b>AI Failure Risk Level:</b>", bold_body_style), Paragraph(f"<b>{machine.failure_risk}</b> (Prob: {machine.failure_probability*100:.1f}%)", body_style)
        ],
        [
            Paragraph("<b>Model / Serial:</b>", bold_body_style), Paragraph(str(machine.model_number), body_style),
            Paragraph("<b>Anomaly Score:</b>", bold_body_style), Paragraph(f"{machine.anomaly_score}%", body_style)
        ],
        [
            Paragraph("<b>Cumulative Run Hours:</b>", bold_body_style), Paragraph(f"{machine.operating_hours:.1f} hrs", body_style),
            Paragraph("<b>Next Scheduled PM:</b>", bold_body_style), Paragraph(str(machine.next_scheduled_maintenance.strftime('%Y-%m-%d') if machine.next_scheduled_maintenance else 'N/A'), body_style)
        ]
    ]
    t_overview = Table(overview_data, colWidths=[120, 150, 130, 140])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 12))

    # 3. Real-Time Telemetry & Threshold Analysis
    story.append(Paragraph("2. REAL-TIME SENSOR TELEMETRY & NOMINAL COMPARISON", section_heading))
    sensor_headers = ["Sensor Parameter", "Current Value", "Baseline Target", "Allowable Range", "Status"]
    
    def get_param_status(val, base, max_dev):
        diff = abs(val - base)
        if diff > max_dev * 1.5:
            return "<font color='#DC2626'>CRITICAL</font>"
        elif diff > max_dev:
            return "<font color='#D97706'>WARNING</font>"
        return "<font color='#16A34A'>NORMAL</font>"

    sensor_rows = [
        [
            Paragraph(f"<b>{sensor_headers[0]}</b>", bold_body_style),
            Paragraph(f"<b>{sensor_headers[1]}</b>", bold_body_style),
            Paragraph(f"<b>{sensor_headers[2]}</b>", bold_body_style),
            Paragraph(f"<b>{sensor_headers[3]}</b>", bold_body_style),
            Paragraph(f"<b>{sensor_headers[4]}</b>", bold_body_style),
        ],
        [
            Paragraph("Temperature (°C)", body_style),
            Paragraph(f"<b>{machine.current_temperature:.1f} °C</b>", body_style),
            Paragraph(f"{machine.baseline_temp:.1f} °C", body_style),
            Paragraph("40.0 - 78.0 °C", body_style),
            Paragraph(get_param_status(machine.current_temperature, machine.baseline_temp, 12.0), body_style),
        ],
        [
            Paragraph("Vibration Velocity (mm/s)", body_style),
            Paragraph(f"<b>{machine.current_vibration:.2f} mm/s</b>", body_style),
            Paragraph(f"{machine.baseline_vib:.2f} mm/s", body_style),
            Paragraph("0.50 - 4.00 mm/s", body_style),
            Paragraph(get_param_status(machine.current_vibration, machine.baseline_vib, 2.0), body_style),
        ],
        [
            Paragraph("Rotational Speed (RPM)", body_style),
            Paragraph(f"<b>{machine.current_rpm:.0f} RPM</b>", body_style),
            Paragraph(f"{machine.baseline_rpm:.0f} RPM", body_style),
            Paragraph(f"{machine.baseline_rpm*0.8:.0f} - {machine.baseline_rpm*1.2:.0f} RPM", body_style),
            Paragraph(get_param_status(machine.current_rpm, machine.baseline_rpm, 250.0), body_style),
        ],
        [
            Paragraph("Hydraulic Pressure (bar)", body_style),
            Paragraph(f"<b>{machine.current_pressure:.1f} bar</b>", body_style),
            Paragraph(f"{machine.baseline_press:.1f} bar", body_style),
            Paragraph("80.0 - 220.0 bar", body_style),
            Paragraph(get_param_status(machine.current_pressure, machine.baseline_press, 40.0), body_style),
        ],
        [
            Paragraph("Power Consumption (kW)", body_style),
            Paragraph(f"<b>{machine.current_power:.1f} kW</b>", body_style),
            Paragraph(f"{machine.baseline_power:.1f} kW", body_style),
            Paragraph("5.0 - 65.0 kW", body_style),
            Paragraph(get_param_status(machine.current_power, machine.baseline_power, 15.0), body_style),
        ]
    ]
    t_sensors = Table(sensor_rows, colWidths=[150, 95, 95, 110, 90])
    t_sensors.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_sensors)
    story.append(Spacer(1, 12))

    # 4. Machine Learning Diagnostics & Explainability
    story.append(Paragraph("3. AI ANOMALY DETECTION & FAILURE PREDICTION ASSESSMENT", section_heading))
    explanation_txt = predictions_info.get("explanation", "Nominal operational telemetry detected by AI ensemble.")
    factors = predictions_info.get("contributing_factors", ["All monitored variables within standard baseline."])
    factors_html = "".join([f"<li>{f}</li>" for f in factors])
    
    ai_box = [
        [
            Paragraph(f"<b>Model Architecture:</b> Isolation Forest (Unsupervised) + Random Forest Classifier (120 Trees, Balanced)<br/>"
                      f"<b>Assessment Summary:</b> {explanation_txt}<br/><br/>"
                      f"<b>Key Contributing Factors Identified:</b><br/>"
                      f"<ul>{factors_html}</ul>", body_style)
        ]
    ]
    t_ai = Table(ai_box, colWidths=[540])
    t_ai.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_ai)
    story.append(Spacer(1, 12))

    # 5. Maintenance Recommendations & Action Plan
    story.append(Paragraph("4. ACTIONABLE MAINTENANCE RECOMMENDATIONS", section_heading))
    rec_list = recommendations.get("recommendations", ["Continue regular Autonomous Maintenance checks."])
    rec_items = "".join([f"<li><b>Step {i+1}:</b> {r}</li>" for i, r in enumerate(rec_list)])
    rec_box = [
        [
            Paragraph(f"<b>Prescribed Maintenance Priority:</b> <font color='#DC2626'><b>{recommendations.get('priority', 'LOW')}</b></font><br/><br/>"
                      f"<b>Engineering Action Items:</b><br/>"
                      f"<ul>{rec_items}</ul>", body_style)
        ]
    ]
    t_rec = Table(rec_box, colWidths=[540])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEFCE8')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FDE047')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_rec)
    story.append(Spacer(1, 12))

    # 6. Active Alerts Log
    story.append(Paragraph("5. RECENT ALERTS & INCIDENT LOG", section_heading))
    if alerts:
        alert_rows = [
            [
                Paragraph("<b>Alert ID</b>", bold_body_style),
                Paragraph("<b>Severity</b>", bold_body_style),
                Paragraph("<b>Timestamp</b>", bold_body_style),
                Paragraph("<b>Detected Condition</b>", bold_body_style),
                Paragraph("<b>Status</b>", bold_body_style),
            ]
        ]
        for a in alerts[:4]:
            stat_text = "RESOLVED" if a.resolved else ("ACKNOWLEDGED" if a.acknowledged else "ACTIVE")
            alert_rows.append([
                Paragraph(a.id, body_style),
                Paragraph(f"<b>{a.severity}</b>", body_style),
                Paragraph(a.timestamp.strftime('%Y-%m-%d %H:%M'), body_style),
                Paragraph(a.anomaly_type[:35], body_style),
                Paragraph(stat_text, body_style),
            ])
        t_alerts = Table(alert_rows, colWidths=[80, 80, 110, 180, 90])
        t_alerts.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_alerts)
    else:
        story.append(Paragraph("No active alerts registered for this asset in the current logging window.", body_style))

    # Footer note
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1')))
    story.append(Spacer(1, 4))
    footer_text = Paragraph(
        "Escorts Kubota Manufacturing Facilities Demo | SMARTMFG AI Engine v1.4 | Report Generated Electronically | Data Classification: SIMULATED / DEMO",
        subtitle_style
    )
    story.append(footer_text)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

