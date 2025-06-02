from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String, index=True)
    is_income = Column(Boolean, default=False)
    date = Column(String, index=True)