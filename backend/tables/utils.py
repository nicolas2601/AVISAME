import qrcode
from io import BytesIO
from django.core.files import File

def generate_qr_code(restaurant_id: int, table_id: int) -> tuple[str, File]:
    """
    Genera un QR code con formato: {restaurant_id}:{table_id}
    Retorna el código en texto y la imagen generada
    """
    qr_data = f"{restaurant_id}:{table_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convertir a BytesIO para guardar en Django
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return qr_data, File(buffer, name=f'qr_{table_id}.png')
