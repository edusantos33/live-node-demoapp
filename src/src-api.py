from typing import Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Header
from pydantic import BaseModel

app = FastAPI(title="Aulas de Pós-Graduação - Exemplo de código vulnerável")

# --- SCHEMAS (PYDANTIC) ---
class OrderResponse(BaseModel):
    id: int
    user_id: str
    item: str
    price: float

class User(BaseModel):
    id: str
    name: str

# --- BANCO DE DADOS SIMULADO (IN-MEMORY) ---
USERS_DB: Dict[str, User] = {
    "1": User(id="1", name="Alice"),        
    "2": User(id="2", name="Atacante Bob")  
}

ORDERS_DB: Dict[int, Dict[str, Any]] = {
    101: {"id": 101, "user_id": "1", "item": "MacBook Pro", "price": 2500.00},
    102: {"id": 102, "user_id": "1", "item": "Monitor 4K", "price": 400.00},
    201: {"id": 201, "user_id": "2", "item": "Mouse Barato", "price": 15.00}
}

async def get_current_user(x_user_id: str = Header(..., description="ID do usuário autenticado")) -> User:
    user = USERS_DB.get(x_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou usuário não autenticado."
        )
    return user

@app.get(
    "/api/v1/orders/{order_id}", 
    response_model=OrderResponse,
    summary="Busca um pedido por ID (Vulnerável a BOLA)"
)
async def get_order_vulnerable(
    order_id: int, 
    current_user: User = Depends(get_current_user)
):
    """
    FLUXO VULNERÁVEL:
    O Bob (User 2) passa 'X-User-Id: 2' no Header (Autenticação OK).
    Porém, ele solicita o 'order_id=101' na URL.
    Como a rota apenas valida a existência do pedido, o dado da Alice é vazado.
    """
    order = ORDERS_DB.get(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Pedido não encontrado."
        )
        
    # A FALHA DE BOLA ESTÁ AQUI: O objeto é retornado sem validar 
    # se order["user_id"] == current_user.id
    return order

# Para rodar: uvicorn arquivo:app --port 8000 --reload
