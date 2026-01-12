from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import stripe
from app.core.config import get_settings
from app.deps import get_current_user
from app.models.user import UserInDB

# Initialize Stripe
# In a real app, strict validation of env vars
STRIPE_SECRET_KEY = "sk_test_sample" # Replace with valid key or env var
stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["payments"])

class PaymentIntentRequest(BaseModel):
    registrationId: str
    amount: float

@router.post("/create-intent")
async def create_payment_intent(request: PaymentIntentRequest, current_user: UserInDB = Depends(get_current_user)):
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=int(request.amount * 100), # Amount in paise/cents
            currency='inr',
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'registrationId': request.registrationId,
                'userId': str(current_user.id)
            }
        )
        return {"clientSecret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
