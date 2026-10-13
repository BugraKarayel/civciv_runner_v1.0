import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Windows font kaydı (Farklı işletim sistemi ihtimaline karşı fallback korumalı)
font_dir = "C:/Windows/Fonts"
if os.path.exists(os.path.join(font_dir, "segoeui.ttf")):
    pdfmetrics.registerFont(TTFont('SegoeUI', os.path.join(font_dir, 'segoeui.ttf')))
    pdfmetrics.registerFont(TTFont('SegoeUI-Bold', os.path.join(font_dir, 'segoeuib.ttf')))
    pdfmetrics.registerFont(TTFont('SegoeUI-Italic', os.path.join(font_dir, 'segoeuii.ttf')))
    BASE_FONT = 'SegoeUI'
    BOLD_FONT = 'SegoeUI-Bold'
else:
    BASE_FONT = 'Helvetica'
    BOLD_FONT = 'Helvetica-Bold'

# Dinamik dosya yolu (Hangi klasörde çalıştırılırsa oraya kaydeder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
pdf_path = os.path.join(BASE_DIR, "Civciv_Runner_Dokumantasyon.pdf")

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    leftMargin=40,
    rightMargin=40,
    topMargin=36,
    bottomMargin=36
)

title_style = ParagraphStyle(
    'DocTitle',
    fontName=BOLD_FONT,
    fontSize=21,
    leading=26,
    textColor=colors.HexColor('#0f172a'),
    spaceAfter=4
)

subtitle_style = ParagraphStyle(
    'DocSubTitle',
    fontName=BASE_FONT,
    fontSize=10.5,
    leading=15,
    textColor=colors.HexColor('#64748b'),
    spaceAfter=12
)

h1_style = ParagraphStyle(
    'Heading1',
    fontName=BOLD_FONT,
    fontSize=12.5,
    leading=17,
    textColor=colors.HexColor('#1e293b'),
    spaceBefore=10,
    spaceAfter=5
)

body_style = ParagraphStyle(
    'Body',
    fontName=BASE_FONT,
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor('#334155'),
    spaceAfter=5
)

bullet_style = ParagraphStyle(
    'Bullet',
    fontName=BASE_FONT,
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor('#334155'),
    leftIndent=14,
    firstLineIndent=-10,
    spaceAfter=3
)

code_style = ParagraphStyle(
    'CodeStyle',
    fontName=BASE_FONT,
    fontSize=8.5,
    leading=12,
    textColor=colors.HexColor('#0957c3')
)

story = []

# Başlık ve Bilgi Kutusu
story.append(Paragraph("Civciv Runner - Teknik & Tasarım Dokümantasyonu", title_style))
story.append(Paragraph("GDG on Campus Bolu Abant İzzet Baysal Üniversitesi | Sürüm: v1.0.0 (Prototip) | Tarih: Ekim 2026", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceAfter=10))

# 1. Giriş ve Proje Özeti
story.append(Paragraph("1. Proje Genel Bakışı", h1_style))
story.append(Paragraph(
    "Civciv Runner, klasik Google Dino sonsuz koşu mekaniği ile Flappy Bird uçuş dinamiğini harmanlayan retro piksel "
    "sanat tarzında bir web oyunudur. Bolu Abant İzzet Baysal Üniversitesi GDG topluluğu için etkinliklerde yarışma ve "
    "etkileşim amacıyla tasarlanmıştır.",
    body_style
))

# 2. Temel Mekanikler
story.append(Paragraph("2. Temel Oynanış & Fazlar (Phases)", h1_style))
story.append(Paragraph("<b>• Kara Modu (Run Mode):</b> Civciv zemin üzerindeki kaya ve kaktüs engellerinin üzerinden zıplayarak ilerler. Engellerin tepesinde risk/ödül mekaniği olarak tohumlar bulunur.", bullet_style))
story.append(Paragraph("<b>• Rampa & Boşluk Mekaniği:</b> Belirli aralıklarla çıkan rampa zıplama platformudur. Rampadan havalanıldığında zemin sona erer. Rampayı es geçen oyuncular boşluğa düşerek elenir.", bullet_style))
story.append(Paragraph("<b>• Uçuş Modu (Fly Mode):</b> Rampadan fırladıktan sonra Flappy Bird stili yerçekimi ve flap mekaniğine geçilir. GDG / AİBÜ logolu borular arasından süzülünür.", bullet_style))
story.append(Paragraph("<b>• Yumuşak Geçişler:</b> Uçuş fazı biterken zemin sağdan kayarak akıcı bir şekilde civcivin altına bağlanır, havada kalan tohumlar temizlenir.", bullet_style))

# 3. Özelleştirme: Kostümler, Paletler ve Sürprizler
story.append(Paragraph("3. Kostümler (Skins), Renk Paletleri & Konami Kodu", h1_style))
story.append(Paragraph("<b>• Karakter Kostümleri (SkinManager):</b> Menü vitrininden seçilebilen 3 özel görünüm mevcuttur: <i>Klasik Civciv</i>, <i>Gözlüklü Dedektif</i> ve <i>Milli Takım Futbolcu</i> (forma ve krampon detaylı).", bullet_style))
story.append(Paragraph("<b>• Dinamik Renk Paletleri (PaletteManager):</b> Oyun içi atmosferi ve gökkuşağı izlerini değiştiren 4 farklı mod bulunur: Palet 1 (Klasik Canlı), Palet 2 (Canlı Pop), Palet 3 (Neon Cyber) ve Palet 4 (Tam Pastel Dünya & Gece Modu).", bullet_style))
story.append(Paragraph("<b>• Konami Kodu Desteği:</b> Gizli kombinasyon aktif edildiğinde civcivin arkasında seçili palete uyumlu piksel gökkuşağı izi (trail) oluşur.", bullet_style))

# 4. Skor & Tohum Sistemi
story.append(Paragraph("4. Skor & Tohum Dengeleme Sistemi", h1_style))
story.append(Paragraph(
    "Oyundaki rekabeti artırmak için net skor formülü yapılandırılmıştır: <b>Net Skor = Mesafe Skoru + Tohum Skoru</b>",
    body_style
))

score_data = [
    [Paragraph("<b>Parametre</b>", body_style), Paragraph("<b>Katsayı / Değer</b>", body_style), Paragraph("<b>Açıklama</b>", body_style)],
    [Paragraph("Mesafe Skoru", body_style), Paragraph("Kat edilen mesafe / 10", code_style), Paragraph("Her 10 piksel ilerleyiş 1 mesafe puanı kazandırır.", body_style)],
    [Paragraph("Tohum Puanı", body_style), Paragraph("Tohum başı +15 Puan", code_style), Paragraph("Her toplanan tohum net skora anında +15 puan ekler.", body_style)],
    [Paragraph("Yüzen Bildirim", body_style), Paragraph("+15 Efekti", code_style), Paragraph("Tohum alındığında retro sarı fontla yukarı süzülen yazı çıkar.", body_style)],
    [Paragraph("HUD Dağılımı", body_style), Paragraph("Net Skor | Mesafe | Tohum", code_style), Paragraph("Üst barda 3 bağımsız sütunda anlık gösterim yapılır.", body_style)]
]

t_score = Table(score_data, colWidths=[110, 140, 265])
t_score.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t_score)
story.append(Spacer(1, 6))

# 5. Hızlanma ve Performans Optimizasyonları
story.append(Paragraph("5. Google Dino Hız Eğrisi & 60Hz Akıcılık Optimizasyonu", h1_style))
story.append(Paragraph("<b>• Sürekli İvmelenme (ACCELERATION = 0.0018):</b> Google Chrome Dino'nun kaynak kodundaki model uygulanmıştır. Hız adım adım değil, hayatta kalınan her saniye yumuşakça 7.0'dan 14.5'e tırmanır.", bullet_style))
story.append(Paragraph("<b>• 100m Milestone / Faz Parlaması:</b> Her 100 metrede bir milestone zil sesi çalar, kıvılcımlar saçılır ve üst bardaki mesafe göstergesi altın renginde yanıp söner.", bullet_style))
story.append(Paragraph("<b>• VSync-Quantized Delta:</b> Windows DWM zamanlayıcı sapmaları 60Hz, 144Hz ve 165Hz monitörler için dar toleranslı filtreye bağlanarak mikro takılmalar (micro-stutter) sıfırlanmıştır.", bullet_style))
story.append(Paragraph("<b>• Integer Snapping:</b> Kamera, zemin ve engeller subpixel judder önlemek amacıyla piksel hizalı (Math.round) çizdirilmektedir.", bullet_style))

# 6. Liderlik Tablosu ve Güvenlik
story.append(Paragraph("6. Liderlik Tablosu & Admin Güvenliği", h1_style))
story.append(Paragraph("<b>• Günlük Sıralama:</b> LocalStorage tabanlı günün en yüksek ilk 10 net skoru saklanır ve IDLE ekranında listelenir.", bullet_style))
story.append(Paragraph("<b>• Küfür Filtresi:</b> Leetspeak ve harf tekrarı varyasyonlarını yakalayan filtre ile uygunsuz isimler rastgele <i>Civciv#XXX</i> olarak maskelenir.", bullet_style))
story.append(Paragraph("<b>• Gizli Admin Paneli:</b> <i>Ctrl + Shift + A</i> kısayolu ile açılan panelden gün sıfırlanabilir, münferit oyuncu silinebilir veya JSON/CSV dışa aktarılabilir.", bullet_style))

# 7. Proje Bağlantıları
story.append(Spacer(1, 4))
story.append(Paragraph("7. Depo & Kod Kaynağı", h1_style))
story.append(Paragraph("<b>GitHub Deposu:</b> <font color='#2563eb'><u>https://github.com/BugraKarayel/civciv-runner-prototip</u></font>", body_style))

doc.build(story)
print(f"PDF başarıyla oluşturuldu: {pdf_path}")