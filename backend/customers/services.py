import logging
from typing import TYPE_CHECKING

from django.conf import settings

if TYPE_CHECKING:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioException
else:
    from twilio.rest import Client  # type: ignore
    from twilio.base.exceptions import TwilioException  # type: ignore

from .models import Customer

logger = logging.getLogger(__name__)


def _get_twilio_client() -> Client | None:
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN

    if not account_sid or not auth_token:
        logger.warning("Twilio credentials are not configured. Skipping SMS send.")
        return None

    return Client(account_sid, auth_token)


def _resolve_recipient_number(raw_phone: str) -> str | None:
    if not raw_phone:
        return None

    phone = raw_phone.strip()
    if phone.startswith("+"):
        return phone

    digits = ''.join(filter(str.isdigit, phone))
    if not digits:
        return None

    country_code = settings.TWILIO_DEFAULT_COUNTRY_CODE or "+57"
    normalized_code = country_code if country_code.startswith("+") else f"+{country_code}"

    if digits.startswith(normalized_code.replace("+", "")):
        return f"+{digits}"

    return f"{normalized_code}{digits}"


def send_verification_code_sms(customer: Customer) -> bool:
    """Send the verification code to the customer's phone via Twilio."""

    client = _get_twilio_client()
    if client is None:
        return False

    if not customer.verification_code:
        logger.warning("Customer %s does not have a verification code to send.", customer.id)
        return False

    to_number = _resolve_recipient_number(customer.phone_number)
    if not to_number:
        logger.warning("Invalid phone number for customer %s: %s", customer.id, customer.phone_number)
        return False

    messaging_service_sid = settings.TWILIO_MESSAGING_SERVICE_SID
    from_number = getattr(settings, "TWILIO_FROM_NUMBER", "")

    if not messaging_service_sid and not from_number:
        logger.warning("Neither Messaging Service SID nor From number configured for Twilio.")
        return False

    message_body = (
        f"AVÍSAME: Tu código de verificación es {customer.verification_code}. "
        "Caduca en 10 minutos."
    )

    try:
        create_kwargs = {
            "to": to_number,
            "body": message_body,
        }

        if messaging_service_sid:
            create_kwargs["messaging_service_sid"] = messaging_service_sid
        else:
            create_kwargs["from_"] = from_number

        message = client.messages.create(**create_kwargs)
        logger.info("Verification SMS sent to %s (SID: %s)", to_number, message.sid)
        return True
    except TwilioException as exc:
        logger.exception("Failed to send verification SMS to %s: %s", to_number, exc)
    except Exception as exc:  # Catch-all to prevent flow interruption
        logger.exception("Unexpected error sending verification SMS to %s: %s", to_number, exc)

    return False
